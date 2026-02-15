import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Dashboard.css";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    budget: "",
    timeline: "",
    demo_date: "",
    client_name: "",
    contact_number: "",
    reference_person: "",
    status: "pending",
  });

  const token = localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/");
  };

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get("/api/projects/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.reverse());
    } catch (error) {
      console.log("Error fetching projects");
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/api/projects/", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchProjects();
      setFormData({
        project_name: "", description: "", budget: "", timeline: "",
        demo_date: "", client_name: "", contact_number: "", reference_person: "", status: "pending"
      });
      setEditingId(null);
    } catch (error) {
      alert("Error saving project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (error) {
      alert("Error deleting project");
    }
  };

  const handleEdit = (project) => {
    setFormData(project);
    setEditingId(project.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProjects = projects.filter((project) =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header fade-in">
        <div>
          <h1 className="dashboard-title">Lumora Portal</h1>
          <p className="dashboard-subtitle">Manage Projects & Clients</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </header>

      <div className="content-grid fade-in">

        {/* FORM SECTION */}
        <div className="form-section">
          <div className="form-card">
            <h3 className="form-title">{editingId ? "Edit Project" : "Add New Project"}</h3>

            <form onSubmit={handleSubmit} className="form-grid">

              <div className="input-group">
                <label className="label-text">Project Name</label>
                <input name="project_name" value={formData.project_name} onChange={handleChange} placeholder="e.g. Website Redesign" className="dashboard-input" required />
              </div>

              <div className="input-group">
                <label className="label-text">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Project details..." className="dashboard-input" />
              </div>

              <div className="row-2">
                <div className="input-group">
                  <label className="label-text">Budget</label>
                  <input name="budget" value={formData.budget} onChange={handleChange} placeholder="$0.00" className="dashboard-input" />
                </div>
                <div className="input-group">
                  <label className="label-text">Timeline</label>
                  <input name="timeline" value={formData.timeline} onChange={handleChange} placeholder="Duration" className="dashboard-input" />
                </div>
              </div>

              <div className="input-group">
                <label className="label-text">Demo / Deadline</label>
                <input type="date" name="demo_date" value={formData.demo_date} onChange={handleChange} className="dashboard-input" />
              </div>

              <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '10px 0' }} />

              <div className="input-group">
                <label className="label-text">Client Name</label>
                <input name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Company or Name" className="dashboard-input" />
              </div>

              <div className="row-2">
                <div className="input-group">
                  <label className="label-text">Phone</label>
                  <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="+1 234..." className="dashboard-input" />
                </div>
                <div className="input-group">
                  <label className="label-text">Reference</label>
                  <input name="reference_person" value={formData.reference_person} onChange={handleChange} placeholder="Ref Name" className="dashboard-input" />
                </div>
              </div>

              <div className="input-group">
                <label className="label-text">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="dashboard-input">
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button type="submit" className="primary-btn">
                {editingId ? "Update Project" : "Create Project"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({ project_name: "", description: "", budget: "", timeline: "", demo_date: "", client_name: "", contact_number: "", reference_person: "", status: "pending" }); }}
                  className="cancel-btn"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="list-section">
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          <div className="projects-grid">
            {filteredProjects.length === 0 ? (
              <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", marginTop: "2rem" }}>No projects found.</p>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h4 className="project-title">{project.project_name}</h4>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>

                  <p className="project-desc">
                    {project.description || "No description provided."}
                  </p>

                  <div className="project-meta">
                    <div className="meta-row"><span>📅</span> {project.demo_date || "N/A"}</div>
                    <div className="meta-row"><span>💰</span> {project.budget ? `$${project.budget}` : "-"}</div>
                    <div className="meta-row"><span>👤</span> {project.client_name || "-"}</div>
                    <div className="meta-row"><span>📞</span> {project.contact_number || "-"}</div>
                  </div>

                  <div className="actions">
                    <button onClick={() => handleEdit(project)} className="action-btn btn-edit">Edit</button>
                    <button onClick={() => handleDelete(project.id)} className="action-btn btn-delete">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
