import React, { useState, useEffect,useRef } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from "axios";
import AddTeamMemberPopup from './AddTeamMemberPopup';
function TeamMember() {
    const { user } = useUserContext();
    const [teamMembers, setTeamMembers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const tableref=useRef(null);
    const isMounted = useRef(true);
    useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
        axios
          .get(`${apiUrl}/team/get/teammembers/${user.id}`)
          .then((response) => {
            setTeamMembers(response.data);
            const $table= window.$(tableref.current);
     const timeoutId = setTimeout(() => {  
      $table.DataTable().destroy();
       $table.DataTable({responsive:true});
             }, 250);
    return () => {
       isMounted.current = false;
    };
          })
          .catch((error) => {
            console.error('Error fetching team members:', error);
          });
      }, [user.id]);
      const handleAddTeamMember = (formData) => {
      };
      const handleDeleteTeamMember = (teamMemberId) => {
        axios
          .delete(`${apiUrl}/team/delete/${teamMemberId}`)
          .then((response) => {
            window.alert('Team member deleted successfully');
            setTeamMembers((prevTeamMembers) =>
              prevTeamMembers.filter((member) => member.id !== teamMemberId)
                      );
          })
          .catch((error) => {
            console.error('Error deleting team member:', error);
          });
      };
return (
  <div className="dashboard__content">
    <section className="page-title-dashboard">
      <div className="themes-container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="title-dashboard">
              <div className="title-dash flex2">Team Members</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="flat-dashboard-setting bg-white">
      <div className="themes-container">
<button onClick={() => setShowPopup(true)} className='button-status'>Add Team Member</button>
{teamMembers.length === 0 ? (
            <p>No team members are available.</p>
          ) : (
            <Table data={teamMembers} handleDelete={handleDeleteTeamMember} ref={tableref} />
          )}
          <AddTeamMemberPopup
            show={showPopup}
            handleClose={() => setShowPopup(false)}
            handleAddTeamMember={handleAddTeamMember}
            userId={user.id}
          />
    </div>
    </section>
     </div>
  );
}
const Table = ({ data, handleDelete }) => {
  return (
    <div className="table-container-wrapper">
    <div className="table-container">
      <table className="responsive-table">
        <thead className="thead-dark">
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((teamMember, index) => (
            <tr key={index}>
              <td>{teamMember.name}</td>
              <td>{teamMember.role}</td>
              <td>{teamMember.email}</td>
              <td>********</td>
              <td>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(teamMember.id);
                  }}
                >
                  Delete
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default TeamMember;