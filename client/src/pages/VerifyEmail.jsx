import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const VerifyEmail = () => {
  const [status, setStatus] = useState("verifying");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify/${token}`);
        setStatus("success");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              {status === "verifying" && (
                <div>
                  <h3>Verifying your email...</h3>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              {status === "success" && (
                <div className="alert alert-success">
                  <h3>Email Verified Successfully!</h3>
                  <p>Redirecting to login page...</p>
                </div>
              )}
              {status === "error" && (
                <div className="alert alert-danger">
                  <h3>Verification Failed</h3>
                  <p>Invalid or expired verification link.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
