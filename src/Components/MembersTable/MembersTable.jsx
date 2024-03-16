import React, { useState, useEffect, useRef } from "react";
import axios from "../../Utils/axios";
import Loader from "../Loader/Loader";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineUserAdd,
} from "react-icons/ai";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { SlUser } from "react-icons/sl";
import { useGlobalContext } from "../../Context/StateContext";

const MembersTable = ({ community }) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [sortedMembers, setSortedMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalData, setAddModalData] = useState(null);
  const { token } = useGlobalContext();

  const loadData = async (res) => {
    setMembers(res);
    setSortedMembers(res);
  };

  const getCommunity = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get(
        `/api/community/${community}/members/`,
        config
      );
      await loadData(res.data.success);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const onAdd = async () => {
    await getCommunity();
  };

  useEffect(() => {
    getCommunity();
  }, []);

  const handleRole = (member) => {
    if (member.is_admin === true) {
      return "Admin";
    } else if (member.is_moderator === true) {
      return "Moderator";
    } else if (member.is_reviewer === true) {
      return "Reviewer";
    }
    return "Member";
  };

  const handleChange = (e) => {
    const search = e.target.value;
    const filteredMembers = members.filter((member) => {
      return member.username.toLowerCase().includes(search.toLowerCase());
    });

    setSortedMembers(filteredMembers);
  };

  const onDelete = async (index) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    await loadData(newMembers);
  };

  const onEdit = async (index, role) => {
    const newMembers = [...members];
    if (role === "Admin") {
      newMembers[index].is_admin = true;
      newMembers[index].is_moderator = false;
      newMembers[index].is_reviewer = false;
    } else if (role === "Moderator") {
      newMembers[index].is_admin = false;
      newMembers[index].is_moderator = true;
      newMembers[index].is_reviewer = false;
    } else if (role === "Reviewer") {
      newMembers[index].is_admin = false;
      newMembers[index].is_moderator = false;
      newMembers[index].is_reviewer = true;
    } else {
      newMembers[index].is_admin = false;
      newMembers[index].is_moderator = false;
      newMembers[index].is_reviewer = false;
    }
    await loadData(newMembers);
  };

  const handleSelect = (e) => {
    const search = e.target.value;
    if (search === "all") {
      setSortedMembers(members);
    } else {
      const filteredMembers = members.filter((member) => {
        return handleRole(member).toLowerCase().includes(search.toLowerCase());
      });
      setSortedMembers(filteredMembers);
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <>
          <div className="w-full">
            <div className="w-full flex flex-row items-center justify-between mb-3">
              <h1 className=" text-lg md:text-2xl font-bold text-green-700">
                {community} Members
              </h1>
              <button
                className="text-sm font-semibold text-white p-2 rounded-lg bg-green-600 flex"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowAddModal(true);
                  setAddModalData({
                    community: community,
                  });
                }}
              >
                <AiOutlineUserAdd className="w-6 h-6" /> Member
              </button>
            </div>
            <div className="w-full flex flex-row items-center justify-between mb-3">
              <input
                style={{ border: "2px solid #cbd5e0" }}
                type="text"
                onChange={handleChange}
                className="w-1/2 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Search members"
              />
              <select
                onChange={handleSelect}
                className="w-1/4 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="reviewer">Reviewer</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>
          <div className="text-gray-900 bg-gray-200">
            <div className="px-3 py-4 flex justify-center">
              <table className="w-full text-sm md:text-md bg-white shadow-md rounded mb-4">
                <tbody>
                  <tr className="border-b">
                    <th className="text-left p-1 px-1 md:p-3 md:px-5 ">
                      Username
                    </th>
                    <th className="text-left p-1 px-1 md:p-3 md:px-5">Email</th>
                    <th className="text-left p-1 px-1 md:p-3 md:px-5">Role</th>
                    <th></th>
                  </tr>
                  {sortedMembers.length !== 0 ? (
                    sortedMembers.map((member, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-green-100 bg-gray-100"
                      >
                        <td className="p-1 px-1 md:p-3 px-0 md:px-5 flex">
                          {member.profile_pic_url.includes("None") ? (
                            <SlUser className="w-6 h-6 mr-3" />
                          ) : (
                            <img
                              src={member.profile_pic_url}
                              className="w-6 h-6 rounded-lg mr-3 hover:text-green-600"
                            />
                          )}
                          <a href={`/profile/${member.username}`}>
                            {member.username}
                          </a>
                        </td>
                        <td className="p-1 text-sm md:text-md px-1 md:p-3 md:px-5">
                          {member.email}
                        </td>
                        <td className="p-1 text-sm md:text-md px-1 md:p-3 md:px-5">
                          {handleRole(member)}
                        </td>
                        <td className="p-1 text-sm md:text-md px-1 md:p-3 md:px-5 flex justify-end">
                          <button
                            type="button"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setShowEditModal(true);
                              setEditModalData({
                                member: member,
                                index: index,
                              });
                            }}
                            className="mr-0 md:mr-3 text-smtext-white py-1 px-1 md:px-2  rounded focus:outline-none focus:shadow-outline"
                          >
                            <AiOutlineEdit className="w-6 h-6" />
                          </button>
                          <button
                            type="button"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setShowDeleteModal(true);
                              setDeleteModalData({
                                username: member.username,
                                userId: member.user_id,
                                index: index,
                              });
                            }}
                            className="text-sm text-white py-1 px-1 md:px-2 rounded focus:outline-none focus:shadow-outline"
                          >
                            <AiOutlineDelete className="w-6 h-6 text-black" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b flex hover:bg-green-100 justify-center text-green-600 bg-gray-100">
                      No Members Found
                    </tr>
                  )}
                  {showDeleteModal && (
                    <DeleteModal
                      community={community}
                      username={deleteModalData.username}
                      userId={deleteModalData.userId}
                      index={deleteModalData.index}
                      setShowDeleteModal={setShowDeleteModal}
                      onDelete={onDelete}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                  {showEditModal && (
                    <EditModal
                      community={community}
                      setShowEditModal={setShowEditModal}
                      member={editModalData.member}
                      index={editModalData.index}
                      onEdit={onEdit}
                      handleRole={handleRole}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                  {showAddModal && (
                    <AddModal
                      community={community}
                      setShowAddModal={setShowAddModal}
                      loading={loading}
                      setLoading={setLoading}
                      onAdd={onAdd}
                    />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MembersTable;

const DeleteModal = ({
  username,
  community,
  onDelete,
  userId,
  index,
  setShowDeleteModal,
  loading,
  setLoading,
}) => {
  const { token } = useGlobalContext();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.delete(
        `/api/community/${community}/remove_member/${userId}`,
        config
      );
      if (res.status === 200) {
        await onDelete(index);
        ToastMaker(res.data.success, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "green",
            fontSize: "20px",
          },
        });
      }
    } catch (error) {
      console.log(error);
      ToastMaker(error.response.data.error, 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
    }
    setShowDeleteModal(false);
    setLoading(false);
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-5/6 md:w-1/2 bg-white p-1 rounded-lg flex flex-col items-center justify-center">
              <h1 className="text-md md:text-xl font-bold text-gray-600 mb-4">
                Are you sure you want to delete this member?
              </h1>
              <div className="w-full flex flex-row items-center justify-center">
                <button
                  className="text-sm font-semibold text-white p-2 px-5 mr-5 rounded-lg bg-green-600 flex"
                  style={{ cursor: "pointer" }}
                  onClick={handleDelete}
                >
                  Yes
                </button>
                <button
                  className="text-sm font-semibold text-white p-2 px-5 rounded-lg bg-red-600 flex ml-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowDeleteModal(false);
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const EditModal = ({
  community,
  setShowEditModal,
  member,
  index,
  onEdit,
  handleRole,
  loading,
  setLoading,
}) => {
  const [role, setRole] = useState(handleRole(member));
  const { token } = useGlobalContext();

  const handleEdit = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.post(
        `/api/community/${community}/promote_member/`,
        {
          username: member.username,
          role: role.toLowerCase(),
        },
        config
      );
      console.log(res);
      if (res.status === 200) {
        await onEdit(index, role.current);
        ToastMaker(res.data.success, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "green",
            fontSize: "20px",
          },
        });
      }
    } catch (error) {
      console.log(error);
      ToastMaker(error.response.data.error, 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
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
              <h1 className="text-md md:text-xl font-bold text-gray-600 mb-4">
                Edit Role
              </h1>
              <div className="w-full flex flex-col items-center justify-center">
                <div className="flex flex-row mt-4">
                  <span className="text-sm md:text-lg font-semibold text-gray-800 mr-5 mt-1">
                    UserName:{" "}
                  </span>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="text"
                    disabled
                    value={member.username}
                    className="w-full p-2 rounded-lg bg-gray-300 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-row mt-4">
                  <span className="text-sm md:text-lg font-semibold text-gray-800 mr-5 mt-1">
                    Email:{" "}
                  </span>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="text"
                    disabled
                    value={member.email}
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
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
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
                  style={{ cursor: "pointer" }}
                  onClick={handleEdit}
                >
                  Make Changes
                </button>
                <button
                  className="text-sm font-semibold text-white p-2 px-5 rounded-lg bg-red-600 flex ml-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowEditModal(false);
                  }}
                >
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

const AddModal = ({
  community,
  setShowAddModal,
  loading,
  setLoading,
  onAdd,
}) => {
  const username = useRef(null);
  const { token } = useGlobalContext();

  const handleAdd = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.post(
        `/api/community/${community}/promote_member/`,
        {
          username: username.current,
          role: "member",
        },
        config
      );
      if (res.status === 200) {
        ToastMaker(res.data.success, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "green",
            fontSize: "20px",
          },
        });
      }
      await onAdd();
    } catch (error) {
      console.log(error);
      ToastMaker(error.response.data.error, 3500, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
    }
    setShowAddModal(false);
    setLoading(false);
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-5/6 md:w-1/2 bg-white p-1 rounded-lg flex flex-col items-center justify-center">
              <h1 className="text-md md:text-xl font-bold text-gray-600 mb-4">
                Add Member
              </h1>
              <div className="w-full flex flex-col items-center justify-center">
                <div className="flex flex-col mt-4">
                  <span className="text-sm md:text-lg font-semibold text-gray-800 mr-2 mt-1">
                    UserName:{" "}
                  </span>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="text"
                    id="username"
                    onChange={(e) => {
                      username.current = e.target.value;
                    }}
                    placeHolder="enter the username"
                    className="w-full rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="w-full flex flex-row items-center justify-center mt-4">
                <button
                  className="text-sm font-semibold text-white p-2 px-5 mr-5 rounded-lg bg-green-600 flex"
                  style={{ cursor: "pointer" }}
                  onClick={handleAdd}
                >
                  Add Member
                </button>
                <button
                  className="text-sm font-semibold text-white p-2 px-5 rounded-lg bg-red-600 flex ml-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowAddModal(false);
                  }}
                >
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
