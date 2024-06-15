import React, { useState } from 'react';
import axios from '../../Utils/axios';
import Loader from '../Loader/Loader';
import ToastMaker from 'toastmaker';
import 'toastmaker/dist/toastmaker.css';
import { useGlobalContext } from '../../Context/StateContext';

const EditModal = ({
  community,
  setShowEditModal,
  member,
  index,
  onEdit,
  handleRole,
  loading,
  setLoading
}) => {
  const [role, setRole] = useState(handleRole(member));
  const { token } = useGlobalContext();

  const handleEdit = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.post(
        `/api/community/${community}/promote_member/`,
        {
          user_id: member.user_id,
          role: role.toLowerCase()
        },
        config
      );
      if (res.status === 200) {
        await onEdit(index, role);
        ToastMaker(res.data.success, 3500, {
          valign: 'top',
          styles: {
            backgroundColor: 'green',
            fontSize: '20px'
          }
        });
      }
    } catch (error) {
      console.log(error);
      ToastMaker(error.response.data.error, 3500, {
        valign: 'top',
        styles: {
          backgroundColor: 'red',
          fontSize: '20px'
        }
      });
    }
    setShowEditModal(false);
    setLoading(false);
  };

  const handleChange = async (e) => {
    setRole(e.target.value);
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-5/6 md:w-1/2 bg-white p-1 rounded-lg flex flex-col items-center justify-center">
              <h1 className="text-md md:text-xl font-bold text-gray-600 mb-4">Edit Role</h1>
              <div className="w-full flex flex-col items-center justify-center">
                <div className="flex flex-row mt-4">
                  <span className="text-sm md:text-lg font-semibold text-gray-800 mr-5 mt-1">
                    UserName:{' '}
                  </span>
                  <input
                    style={{ border: '2px solid #cbd5e0' }}
                    type="text"
                    disabled
                    value={member.username}
                    className="w-full p-2 rounded-lg bg-gray-300 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-row mt-4">
                  <span className="text-sm md:text-lg font-semibold text-gray-800 mr-5 mt-1">
                    Role:
                  </span>
                  <select
                    onChange={(e) => handleChange(e)}
                    defaultValue={handleRole(member)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                    <option value="Admin">Admin</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
              </div>
              <div className="w-full flex flex-row items-center justify-center mt-4">
                <button
                  className="text-sm font-semibold text-white p-2 px-5 mr-5 rounded-lg bg-green-600 flex"
                  style={{ cursor: 'pointer' }}
                  onClick={handleEdit}>
                  Make Changes
                </button>
                <button
                  className="text-sm font-semibold text-white p-2 px-5 rounded-lg bg-red-600 flex ml-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowEditModal(false);
                  }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModal;
