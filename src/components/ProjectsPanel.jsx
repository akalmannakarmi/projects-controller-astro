import { useState, useEffect } from "react";
import { getProjects, startProject, stopProject, getProjectStatus } from "../lib/api.js";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load projects and immediately fetch status
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      const projectsWithStatus = await Promise.all(
        data.map(async (p) => {
          try {
            const { status } = await getProjectStatus(p.id);
            return { ...p, status };
          } catch {
            return { ...p, status: "unknown" };
          }
        })
      );
      setProjects(projectsWithStatus);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll status every 15s
  const pollStatus = async () => {
    const updatedProjects = await Promise.all(
      projects.map(async (p) => {
        try {
          const { status } = await getProjectStatus(p.id);
          return { ...p, status };
        } catch {
          return p;
        }
      })
    );
    setProjects(updatedProjects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (projects.length > 0) pollStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [projects]);

  const handleStart = async (id) => {
    await startProject(id);
    pollStatus();
  };

  const handleStop = async (id) => {
    await stopProject(id);
    pollStatus();
  };

  // Badge colors
  const getStatusBadge = (status) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "stopped":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <a
          href="/projects/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Project
        </a>
      </div>

      {loading && <p>Loading projects...</p>}

      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className={`mt-2 px-3 py-1 rounded-full font-medium w-max ${getStatusBadge(p.status)}`}>
                {p.status.toUpperCase()}
              </div>
            </div>


            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded text-white font-medium transition transform ${p.status === "running"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 active:scale-95 shadow"
                  }`}
                onClick={() => handleStart(p.id)}
                disabled={p.status === "running"}
              >
                Start
              </button>

              <button
                className={`px-3 py-1 rounded text-white font-medium transition transform ${p.status === "stopped"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 active:scale-95 shadow"
                  }`}
                onClick={() => handleStop(p.id)}
                disabled={p.status === "stopped"}
              >
                Stop
              </button>

              <a
                href={`/projects/edit?id=${p.id}`}
                className="px-3 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-95 shadow transition transform"
              >
                Edit
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

