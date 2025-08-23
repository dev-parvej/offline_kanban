package middleware

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/dev-parvej/offline_kanban/pkg/util"
)

func Authenticate(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bearer := r.Header.Get("Authorization")

		if bearer != "" {
			util.Res.Writer(w).Status403().Data(map[string]string{"message": "User is not logged in"})
			return
		}

		token := strings.Split(bearer, " ")[1]

		data, err := util.Token().VerifyToken(token)

		if err != nil {
			util.Res.Writer(w).Status403().Data(map[string]string{
				"message": "Invalid loigin",
			})
			return
		}

		r.Header.Add("user_id", strconv.Itoa(data.UserId))
		h.ServeHTTP(w, r)
	})
}
