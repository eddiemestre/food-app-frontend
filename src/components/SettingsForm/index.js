import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Container, 
        InputTitle, 
        InputText, 
        Error, 
        FieldDetailText, 
        ChoicesContainer, 
        Save, 
        Exit, 
        PasswordText, 
        SvgArrow, 
        PasswordContainer,
        SaveButton } from "./Styles";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';

    const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
    const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


const SettingsForm = ({ setUpdatedSettings }) => {
    // hooks
    const { auth, setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    // state
    const [errorMessages, setErrorMessages] = useState({});
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [orName, setOrName] = useState('');
    const [orUsername, setOrUsername] = useState('');
    const [orEmail, setOrEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true)
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const errors = {
        uname: "Invalid username. Should contain only letters and numbers and be 4 - 23 characters long.",
        unameTaken: "Username already taken. Please pick another.",
        name: "Invalid name.",
        nameLength: "Name must be less than 50 characters long.",
        emailTaken: "An account with this email already exists. Please use another.",
        server: "No server response.",
        other: "Failed to update user settings. Please try again.",
        noChanges: "No changes to commit."
      };

      useEffect(() => {
        setIsLoading(true)
        // console.log("in settings form use effect", auth)
        setName(auth?.name || '')
        setUsername(auth?.username || '')
        setEmail(auth?.email || '')
        setOrName(auth?.name || '')
        setOrUsername(auth?.username || '')
        setOrEmail(auth?.email || '')
        if (auth?.name) {
            setIsLoading(false)
        }
    }, [auth])

    const errorExpiration = async () => {
        await delay(5000);
        setErrorMessages({})
    };

    useEffect(() => {
        // console.log("in errorMessages use effect")
        if (Object.keys(errorMessages).length > 0) {
            // console.log("has error messages")
            errorExpiration()
        }
    }, [errorMessages])

    // useEffect(() => {
    //     setErrorMessages({})   
    // }, [name, username, email])

    
    const handleSubmit = async (event) => {
        event.preventDefault();
        // console.log("Submit settings change")

        const userCheck = USER_REGEX.test(username);
        // const emailCheck = EMAIL_REGEX.test(email);

        if (!userCheck) {
            setErrorMessages({name: "uname", message: errors.uname}); 
            setUsername(orUsername)
            return;
        }

        var data = {}

        if (orEmail !== email) {
            data['email'] = email
        } 
        if (orName !== name) {
            data['name'] = name
        }
        if (orUsername !== username) {
            data['username'] = username
        }

        // if changes aren't different, return before patching
        if (Object.keys(data).length === 0) {
            // console.log("no changes to commit");
            return;
        }

        try {
            const response = await axiosPrivate.patch(`auth/update_profile/${auth?.user_id}/`,
              JSON.stringify(data),
              {
                headers: {'Content-Type': 'application/json'},
                withCredentials: true
              }
            );

            setAuth(prevState => ({
                ...prevState,
                "username": username,
                "email": email,
                "name": name
              }))


            // set notice prop
            setUpdatedSettings(true)

        } catch (err) {
            // console.log(err.response)
            if (!err?.response) {
              setErrorMessages({name: "server", message: errors.server});
            } else if (err.response?.status === 400) {
              
              // username must be unique backend check
              if (err.response.data['username']) {
                const usernameError = err.response.data['username'];
                const errorCheck = usernameError.at(0);
                // console.log("error check", errorCheck)
                if (errorCheck === "This field must be unique.") { 
                    setErrorMessages({name: "unameTaken", message: errors.unameTaken}); 
                    setUsername(orUsername)
                } else if (errorCheck === "account with this username already exists.") {
                    setErrorMessages({name: "unameTaken", message: errors.unameTaken}); 
                    setUsername(orUsername)
                } else if (errorCheck === "Ensure this field has no more than 30 characters.") {

                }

              } 
              // 
              else if (err.response.data['email']) {
                const emailError = err.response.data['email'];
                const errorCheck = emailError.at(0);
                if (errorCheck === "account with this email already exists.") { 
                    setErrorMessages({name: "emailTaken", message: errors.emailTaken}); 
                    setEmail(orEmail)
                }
              }

              else if(err.response.data['name']) {
                const nameError = err.response.data['name'];
                const errorCheck = nameError.at(0);
                setErrorMessages({name: "nameLength", message: errors.nameLength}); 
                setName(orName)
              }
            } else {
              setErrorMessages({name: "other", message: errors.other})
            }
        }
    }

    const OnNameChange = (event) => {
        setName(event.target.value)
    }

    const OnUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const OnEmailChange = (event) => {
        setEmail(event.target.value)
    }

    // Generate JSX code for error message
    const renderErrorMessage = (name) =>
        name === errorMessages.name && (
            <Error>{errorMessages.message}</Error>
        );

    const RightArrow = (
        <SvgArrow
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="none"
            viewBox="0 0 30 30"
        >
            <path
                fill="#fff"
                d="M10.737 20.738L16.462 15l-5.725-5.738L12.5 7.5 20 15l-7.5 7.5-1.763-1.762z"
            ></path>
        </SvgArrow>
    )

    const Components = (
        <Container>
        <form onSubmit={handleSubmit}>
                <InputTitle>Full Name</InputTitle>
                <InputText placeholder="name i.e. &quot;John&quot;..." value={name} type="text" name="name" onChange={(e) => OnNameChange(e)} />
                {renderErrorMessage("name")}
                {renderErrorMessage("nameLength")}
                <InputTitle>Username</InputTitle>
                <InputText placeholder="username i.e. &quot;johnsmith89&quot;..." value={username} type="text" name="uname" onChange={(e) => OnUsernameChange(e)} />
                {renderErrorMessage("uname")}
                {renderErrorMessage("unameTaken")}
                <InputTitle>Email</InputTitle>
                <InputText placeholder="email..." value={email} type="text" name="email" onChange={(e) => OnEmailChange(e)} />
                {renderErrorMessage("email")}
                {renderErrorMessage("emailTaken")}
                <InputTitle>Password</InputTitle>
                <PasswordContainer onClick={() => navigate(`/update-password/`)}>
                    <PasswordText value="change password" type="text" readOnly />
                    {RightArrow}
                </PasswordContainer>
                
                <FieldDetailText>Password saved separately</FieldDetailText>
                <br />
                <ChoicesContainer>
                    <Save><SaveButton>Save</SaveButton></Save>
                    <Exit onClick={() => navigate(`/user/${auth?.username}/`)}>Exit</Exit>
                </ChoicesContainer>
        </form>
        </Container>
    )

    return (
        <>
            {!isLoading && Components}
        </>
    )
}

export default SettingsForm;