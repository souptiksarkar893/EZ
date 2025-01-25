import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";

const Dashboard = () => {
  const { user } = useAuth();

  const handleUploadSuccess = () => {
    // Force refresh of FileList component
    window.location.reload();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row">
        <div className="col-12">
          {user?.role === "ops" && (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          )}
          <FileList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
