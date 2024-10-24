import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
import "./Login.css";
import { login } from "../../apiAuth/auth";
import { AuthContext } from "../../components/context/Auth";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function Login() {
  const navigate = useNavigate();

  const { dispatch } = useContext(AuthContext);

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      const response = await login(values);
      Cookies.set("token", response.data.data.token, { expires: 7 });
      dispatch({ type: "login", payload: response.data.data });
      toast.success("Login successful!");

      navigate("/");
    } catch (error) {
      setSubmitting(false);
      if (error.response && error.response.status === 422) {
        setFieldError("email", "Invalid email or password");
        setFieldError("password", "Invalid email or password");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <img src="trello.svg" alt="Trello Logo" />
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <h2>Log in to continue</h2>
              <div className="m-2">
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="form-control"
                  required
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-danger ms-2 mt-1"
                />
              </div>
              <div className="m-2">
                <Field
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="form-control"
                  required
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-danger ms-2 mt-1"
                />
              </div>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner
                      animation="border"
                      size="md"
                      className="text-center"
                    />
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
              {/* <Link to="/register">Create an account</Link> */}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
