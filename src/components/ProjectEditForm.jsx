import { useState, useEffect } from "react";
import { getProjectById, updateProject, deleteProject } from "../lib/api.js";

export default function ProjectEditForm() {
  const [project, setProject] = useState(null);
  const [name, setName] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Get projectId from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        const data = await getProjectById(projectId);
        setProject(data);
        setName(data.name);
        setInstanceId(data.instanceId || "");
      } catch (err) {
        console.error("Failed to load project", err);
      }
    };

    fetchProject();
  }, []);

  const handleUpdate = async () => {
    if (!name || !instanceId) return alert("Fill all fields");
    setLoading(true);
    try {
      await updateProject(project.id, { name, instanceId });
      window.location.href = "/projects";
    } catch (err) {
      console.error(err);
      alert("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== project.name) return alert("Project name mismatch!");
    try {
      await deleteProject(project.id);
      window.location.href = "/projects";
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Edit Project</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={instanceId}
          onChange={(e) => setInstanceId(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 active:scale-95 shadow transition transform"
        >
          {loading ? "Updating..." : "Update Project"}
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="bg-red-600 text-white py-2 rounded hover:bg-red-700 active:scale-95 shadow mt-2"
        >
          Delete Project
        </button>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-xl flex flex-col gap-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-red-600">Delete Project</h3>
            <p>Type <strong>{project.name}</strong> to confirm</p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="border p-2 rounded"
              placeholder="Project Name"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 active:scale-95 shadow transition transform"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

