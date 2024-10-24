import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { register } from "../../apiAuth/auth";
import Spinner from "react-bootstrap/Spinner";

import "../login/Login.css";

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function Register() {
  const navigate = useNavigate();

  const handleRegister = async (values, { setSubmitting, setFieldError }) => {
    try {
      const response = await register(values);
      toast.success("Added new user successful!");
      navigate("/");
    } catch (error) {
      setSubmitting(false);
      if (error.response && error.response.status === 422) {
        setFieldError("email", "Invalid data. Please check your inputs.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <img src="trello.svg" alt="image" />
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <h2>Add New USer</h2>
              <div className="mb-3">
                <Field
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="form-control"
                  required
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger ms-2 mt-1"
                />
              </div>
              <div className="mb-3">
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="form-control"
                  required
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger ms-2 mt-1"
                />
              </div>
              <div className="mb-3">
                <Field
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="form-control"
                  required
                />
                <ErrorMessage
                  name="password"
                  component="div"
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
                  "Add"
                )}
              </Button>
              {/* <Link to="/login">Log in</Link> */}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;
