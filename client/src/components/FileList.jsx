import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get("/files/list");
      setFiles(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load files");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await api.get(`/files/download/${fileId}`);
      const downloadLink = response.data["download-link"];
      window.open(`${import.meta.env.VITE_API_URL}${downloadLink}`, "_blank");
    } catch (err) {
      setError("Failed to download file");
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Files</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td>{file.originalName}</td>
                  <td>{(file.size / 1024).toFixed(2)} KB</td>
                  <td>{file.uploadedBy?.email}</td>
                  <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.role === "client" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownload(file._id)}
                      >
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileList;
