import { useState } from "react";
import { createProject } from "../lib/api.js";

export default function ProjectCreateForm() {
  const [name, setName] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !instanceId) return alert("Fill all fields");
    setLoading(true);
    try {
      await createProject({ name, instanceId });
      window.location.href = "/projects";
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Create Project</h2>
      <div className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Instance ID"
          value={instanceId}
          onChange={(e) => setInstanceId(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </div>
    </div>
  );
}
