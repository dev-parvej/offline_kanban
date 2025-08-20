import FormGroup from "../components/ui/FormGroup";
import {Input} from "../components/ui/Input";
import {Button} from "../components/ui/Button";
import {useState} from "react";
import { SetupRoot } from "../../wailsjs/go/main/App";
import { useToast } from "../hook";
import { FieldValues, useForm } from "react-hook-form";

export const RootUserForm = ({rootSaved}: {rootSaved: () => void}) => {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const { showToast, ToastContainer } = useToast()
    const { register, handleSubmit, formState: { errors } } = useForm()

    const saveUser = async (data: FieldValues) => {
        setIsLoading(true);
        try {
            await SetupRoot(data.userName || "", data.password)
            showToast("Root user created successfully!", "success");
        } catch (error) {
            console.error("Error creating root user:", error);
            showToast("Failed to create root user. Please try again.", "error");
        } finally {
            setIsLoading(false);
            rootSaved();
        }
    }
    return (
      <form onSubmit={handleSubmit(saveUser)} className="flex flex-col gap-4">
          <h3>When you first install offline Kanban, You have to set up a root user name and password. This user will conduct most of the things in the app</h3>
        
          <FormGroup label="User name" errorMessage={errors.userName?.message as string}>
              <Input placeholder="User Name"
                    { ...register("userName", { 
                            required: "User name is required", 
                            minLength: {
                                value: 4, 
                                message: "User name must be at least 4 characters long"
                            }, 
                            maxLength: {
                                value: 20, message: "User name must not exceed 20 characters"
                            } 
                        }) 
                    }
              />
          </FormGroup>
          <FormGroup label="Password" errorMessage={errors.password?.message as string}>
              <Input placeholder="Password"
                     type="password"
                     { ...register("password", { 
                            required: "Password is required", 
                            minLength: {
                            value: 4, message: "Password must be at least 4 characters long"
                            }, 
                            maxLength: {
                                value: 12, 
                                message: "Password must not exceed 12 characters"
                            } 
                        }) 
                    }
              />
          </FormGroup>

          <Button type="submit" isLoading={isLoading} >Save</Button>
          <ToastContainer />
      </form>
    )
}