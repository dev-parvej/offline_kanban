package controller

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dev-parvej/offline_kanban/config"
	"github.com/dev-parvej/offline_kanban/middleware"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/dev-parvej/offline_kanban/repository"
	"github.com/gorilla/mux"
)

type Auth struct {
	router                 *mux.Router
	repository             *repository.UserRepository
	refreshTokenRepository *repository.RefreshTokenRepository
}

func AuthController(router *mux.Router, db *database.Database) *Auth {
	return &Auth{
		router:                 router,
		repository:             repository.NewUserRepository(db),
		refreshTokenRepository: repository.NewRefreshTokenRepository(db),
	}
}

func (auth *Auth) Router() {
	authRouter := auth.router.PathPrefix("/auth").Subrouter()

	// Authentication routes
	authRouter.HandleFunc("/login", auth.login).Methods("POST")
	authRouter.HandleFunc("/logout", auth.logout).Methods("POST")
	authRouter.HandleFunc("/refresh", auth.refreshToken).Methods("POST")
	authRouter.HandleFunc("/verify", auth.verifySession).Methods("GET")

	// User profile management
	userRouter := auth.router.PathPrefix("/user").Subrouter()
	userRouter.Use(middleware.Authenticate)
	userRouter.HandleFunc("/profile", auth.getProfile).Methods("GET")
	userRouter.HandleFunc("/profile", auth.updateProfile).Methods("PUT")
	userRouter.HandleFunc("/change-password", auth.changePassword).Methods("POST")
}

func (auth *Auth) login(w http.ResponseWriter, r *http.Request) {
	loginDto, errors := util.ValidateRequest(r, dto.LoginDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	user, err := auth.repository.FindByUsername(loginDto.UserName)

	if err != nil {
		util.Res.Writer(w).Status(401).Data("Invalid username or password")
		return
	}

	if util.ComparePassword(user.Password, loginDto.Password) {
		accessToken, refreshToken, err := generateAccessAndRefreshToken(user.ID)
		if err != nil {
			util.Res.Writer(w).Status(500).Data(err.Error())
			return
		}

		go auth.refreshTokenRepository.Create(
			user.ID,
			refreshToken,
			time.Now().Add(time.Duration(util.ParseInt(config.Get("REFRESH_TOKEN_EXPIRATION")))*(time.Hour*24)),
		)

		util.Res.Writer(w).Status().Data(dto.NewLoginResponse().Create(map[string]interface{}{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"user":          user,
		}))
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Something went wrong",
	})
}

func (auth *Auth) logout(w http.ResponseWriter, r *http.Request) {
	logoutDto, errors := util.ValidateRequest(r, dto.LogoutDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	_, err := auth.refreshTokenRepository.FindByToken(logoutDto.RefreshToken)

	if err != nil {
		util.Res.Writer(w).Status(401).Data(err.Error())
		return
	}

	error := auth.refreshTokenRepository.RevokeToken(logoutDto.RefreshToken)

	if error != nil {
		util.Res.Writer(w).Status(401).Data(error.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Logged out successfully",
	})
}

func (auth *Auth) refreshToken(w http.ResponseWriter, r *http.Request) {
	refreshDto, errors := util.ValidateRequest(r, dto.RefreshTokenDto{})
	fmt.Println(refreshDto)
	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	_, err := util.Token().VerifyToken(refreshDto.RefreshToken)

	fmt.Println(err.Error())

	if err != nil {
		util.Res.Writer(w).Status(401).Data(err.Error())
		return
	}

	userToken, err := auth.refreshTokenRepository.FindByToken(refreshDto.RefreshToken)

	fmt.Println(userToken, err.Error())

	if err != nil {
		util.Res.Writer(w).Status(401).Data(err.Error())
		return
	}

	if userToken.IsRevoked {
		util.Res.Writer(w).Status(401).Data("Refresh token is revoked")
		return
	}

	accessToken, newRefreshToken, _ := generateAccessAndRefreshToken(userToken.UserID)
	fmt.Println(accessToken, newRefreshToken)
	go auth.refreshTokenRepository.RevokeToken(refreshDto.RefreshToken)

	util.Res.Writer(w).Status().Data(dto.NewRefreshTokenResponse().Create(map[string]interface{}{
		"AccessToken":  accessToken,
		"RefreshToken": newRefreshToken,
	}))
}

func (auth *Auth) verifySession(w http.ResponseWriter, r *http.Request) {
	bearer := r.Header.Get("Authorization")

	if bearer == "Bearer " {
		util.Res.Writer(w).Status403().Data(map[string]string{"message": "LoginRequired"})
		return
	}

	token := strings.Split(bearer, " ")[1]

	data, err := util.Token().VerifyToken(token)

	if err != nil {
		util.Res.Writer(w).Status(401).Data(err.Error())
		return
	}

	userId := data.UserId

	user, err := auth.repository.FindByID(userId)

	if err != nil {
		util.Res.Writer(w).Status(404).Data("User not found")
		return
	}

	util.Res.Writer(w).Status().Data(map[string]*repository.User{
		"user": user,
	})
}

func (auth *Auth) getProfile(w http.ResponseWriter, r *http.Request) {
	userId := r.Header.Get("user_id")
	user, err := auth.repository.FindByID(util.ParseInt(userId))

	if err != nil {
		util.Res.Writer(w).Status(404).Data("User not found")
		return
	}

	util.Res.Writer(w).Status().Data(map[string]*repository.User{
		"user": user,
	})
}

func (auth *Auth) updateProfile(w http.ResponseWriter, r *http.Request) {
	updateProfileDto, errors := util.ValidateRequest(r, dto.UpdateProfileDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	userId := r.Header.Get("user_id")
	_, err := auth.repository.FindByID(util.ParseInt(userId))

	if err != nil {
		util.Res.Writer(w).Status(404).Data("User not found")
		return
	}

	user, err := auth.repository.UpdateProfile(util.ParseInt(userId), &updateProfileDto.Name, &updateProfileDto.Designation)

	if err != nil {
		util.Res.Writer(w).Status(404).Data("Unable to update the user")
		return
	}

	util.Res.Writer(w).Status().Data(map[string]*repository.User{
		"user": user,
	})
}

func (auth *Auth) changePassword(w http.ResponseWriter, r *http.Request) {
	changePasswordDto, errors := util.ValidateRequest(r, dto.ChangePasswordDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	userId := r.Header.Get("user_id")
	user, err := auth.repository.FindByID(util.ParseInt(userId))

	if err != nil {
		util.Res.Writer(w).Status(404).Data(map[string]string{"message": "User not found"})
		return
	}

	if !util.ComparePassword(user.Password, changePasswordDto.CurrentPassword) {
		util.Res.Writer(w).Status(404).Data(map[string]string{"message": "Current password didn't matched"})
		return
	}

	hashed, err := util.HashPassword(changePasswordDto.NewPassword)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(map[string]string{"message": "Something went wrong"})
		return
	}

	auth.repository.UpdatePassword(user.ID, hashed)

	go auth.refreshTokenRepository.RevokeAllUserTokens(user.ID)

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Passowrd updated please re-login to continue",
	})
}

func generateAccessAndRefreshToken(userId int) (string, string, error) {
	accessToken, aErr := util.Token().AccessToken(userId)
	refreshToken, rErr := util.Token().RefreshToken()

	if aErr != nil || rErr != nil {
		return "", "", util.IfThenElse(aErr != nil, aErr, rErr).(error)
	}
	return accessToken, refreshToken, nil

}
