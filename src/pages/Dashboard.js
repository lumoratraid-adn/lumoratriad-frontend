import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";




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
    setProjects(response.data);
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
      await api.put(
        `/api/projects/${editingId}/`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } else {
      await api.post(
        "/api/projects/",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }

    await fetchProjects();

    setFormData({
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

    setEditingId(null);

  } catch (error) {
    alert("Error saving project");
  }
};


  // 🔥 Delete with confirmation
const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this project?");
  if (!confirmDelete) return;

  try {
    await api.delete(
      `/api/projects/${id}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchProjects();

  } catch (error) {
    alert("Error deleting project");
  }
};


  const handleEdit = (project) => {
    setFormData(project);
    setEditingId(project.id);
  };

  // 🔥 Search Filter Logic
  const filteredProjects = projects.filter((project) =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <hr />

      <div style={styles.card}>
        <h3>{editingId ? "Update Project" : "Create Project"}</h3>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <input name="project_name" value={formData.project_name} onChange={handleChange} placeholder="Project Name" />
          <input name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
          <input name="budget" value={formData.budget} onChange={handleChange} placeholder="Budget" />
          <input name="timeline" value={formData.timeline} onChange={handleChange} placeholder="Timeline" />
          <input type="date" name="demo_date" value={formData.demo_date} onChange={handleChange} />
          <input name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Client Name" />
          <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="Contact Number" />
          <input name="reference_person" value={formData.reference_person} onChange={handleChange} placeholder="Reference Person" />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <button type="submit" style={styles.primaryBtn}>
            {editingId ? "Update Project" : "Create Project"}
          </button>
        </form>
      </div>

      <hr />

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by Project Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchBox}
        />
      </div>

      <div>
        {filteredProjects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <h4>{project.project_name}</h4>
              <p>{project.description}</p>
              <p><strong>Status:</strong> {project.status}</p>

              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleEdit(project)} style={styles.editBtn}>
                  Edit
                </button>
                <button onClick={() => handleDelete(project.id)} style={styles.deleteBtn}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 🔥 Professional Style Object
const styles = {
  card: {
    background: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  primaryBtn: {
    gridColumn: "span 2",
    padding: "10px",
    background: "#1e40af",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px"
  },
  editBtn: {
    marginRight: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "4px"
  },
  deleteBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "4px"
  },
  logoutBtn: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: "8px 14px",
    cursor: "pointer",
    borderRadius: "4px"
  },
  projectCard: {
    background: "white",
    padding: "15px",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: "15px"
  },
  searchBox: {
    padding: "8px",
    width: "100%",
    borderRadius: "4px",
    border: "1px solid #ccc"
  }
};

export default Dashboard;
