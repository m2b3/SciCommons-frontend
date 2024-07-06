import React, { useEffect, useState } from 'react';
import UserEmailContainer from './UserEmailContainer';
import MDEditor from '@uiw/react-md-editor';
import { IoIosSend } from 'react-icons/io';
import { FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from '../../Utils/axios';
import { useGlobalContext } from '../../Context/StateContext';

// import ReactMarkdown from 'react-markdown';
// import ReactDOMServer from 'react-dom/server';

function SendInvitationPage({ community }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [users, setUsers] = useState([]);
  const [value, setValue] = React.useState();
  const [subject, setSubject] = useState('');
  const referralLink = `https://www.scicommons.org/invitation/private/${community?.referral_id}`;
  const { token } = useGlobalContext();
  // const [community, setCommunity] = useState(null);

  // useEffect(() => {
  //   const getCommunity = async () => {
  //     try {
  //       const config = {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       };
  //       const res = await axios.get(`/api/community/mycommunity/`, config);
  //       setCommunity(res.data.success.Community_name);
  //     } catch (error) {
  //       console.error('Network error:', error);
  //     }
  //   };
  //   getCommunity();
  // }, []);

  function sendEmail() {
    // let emailAddresses = users.map((user) => user.email).join(',');
    // let sub = subject;
    // let body = value;

    // window.open(
    //   `mailto:${emailAddresses}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`
    // );

    joinPrivateCommunity();
  }

  const joinPrivateCommunity = async () => {
    if (users.length === 0) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const data = {
        requested_emails: users,
        subject: subject,
        body: value
      };
      const res = await axios.post(
        `/api/community/${community.Community_name}/privateJoinUserset/`,
        data,
        config
      );
      toast.success(res?.data?.success);
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteEmail = (email) => {
    setUsers(users.filter((user) => user !== email));
  };

  return (
    <div className="w-full h-full flex flex-col p-8">
      <div className="w-full flex flex-row items-center justify-between">
        <span className="text-3xl font-bold">Send Invite</span>
        <button
          className="flex flex-row items-center w-fit ml-2 p-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all duration-150"
          onClick={() => {
            users.length > 0 && sendEmail();
          }}>
          Send
          <IoIosSend className="text-white ml-1 text-lg" />
        </button>
      </div>
      <div className="w-full mt-5 bg-slate-100 p-2 rounded-xl items-center flex flex-col">
        <span className="text-lg font-semibold">Email Draft</span>
        <div className="flex flex-col w-full mt-2">
          <span className="mb-2 ml-1">Community Referral Link:</span>
          <div className="w-full flex flex-col relative">
            <FaCopy
              className="text-sm text-slate-700 absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer hover:scale-125 hover:shadow-md transition-all duration-150 ease-in-out"
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                toast.success('Link copied to clipboard!');
              }}
            />
            <input
              type="text"
              id="referral link"
              placeholder=""
              value={referralLink}
              disabled
              className="w-full p-2.5 pr-8 rounded-xl text-slate-500 font-semibold text-sm bg-slate-50 border border-gray-300 focus:ring-green-500 focus:border-green-500 italic"
            />
          </div>
        </div>
        <div className="flex flex-row flex-wrap w-full bg-[#0E1117] rounded-t-xl border-b border-b-gray-700 p-4 gap-3 mt-5 max-h-96 overflow-y-auto">
          <span className="text-base text-gray-400 font-normal">Accepted: </span>
          {community?.accepted_emails.length > 0 ? (
            community?.accepted_emails.map((user) => {
              return (
                <UserEmailContainer user={user} key={user} handleDeleteEmail={handleDeleteEmail} />
              );
            })
          ) : (
            <span className="text-base text-gray-500 font-normal">No users added</span>
          )}
        </div>
        <div className="flex flex-row flex-wrap w-full bg-[#0E1117] border-b border-b-gray-700 p-4 gap-3 max-h-96 overflow-y-auto">
          <span className="text-base text-gray-400 font-normal">Discarded: </span>
          {community?.discarded_emails.length > 0 ? (
            community?.discarded_emails.map((user) => {
              return (
                <UserEmailContainer user={user} key={user} handleDeleteEmail={handleDeleteEmail} />
              );
            })
          ) : (
            <span className="text-base text-gray-500 font-normal">No users added</span>
          )}
        </div>
        <div className="flex flex-row flex-wrap w-full bg-[#0E1117] rounded-b-xl border-b border-b-gray-700 p-4 gap-3 max-h-96 overflow-y-auto">
          <span className="text-base text-gray-400 font-normal">Pending: </span>
          {community?.requested_emails.length > 0 ? (
            community?.requested_emails.map((user) => {
              return (
                <UserEmailContainer user={user} key={user} handleDeleteEmail={handleDeleteEmail} />
              );
            })
          ) : (
            <span className="text-base text-gray-500 font-normal">No users added</span>
          )}
        </div>
        <div className="mt-2 bg-[#0E1117] rounded-xl w-full">
          <div className="flex flex-row flex-wrap w-full bg-[#0E1117] rounded-t-xl border-b border-b-gray-700 p-4 gap-3 max-h-96 overflow-y-auto">
            <span className="text-base text-gray-400 font-normal">To: </span>
            {users.length > 0 ? (
              users.map((user) => {
                return (
                  <UserEmailContainer
                    user={user}
                    key={user}
                    handleDeleteEmail={handleDeleteEmail}
                  />
                );
              })
            ) : (
              <span className="text-base text-gray-500 font-normal">No users added</span>
            )}
          </div>
          <div className="flex flex-row items-center w-full bg-[#0E1117] border-b border-b-gray-700 overflow-hidden pl-4">
            <span className="text-base text-gray-400 font-normal ">Subject:</span>
            <input
              type="text"
              id="subject"
              placeholder="Enter Subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
              className="w-full p-4 bg-[#0E1117] text-gray-300 border-none focus:ring-transparent caret-white placeholder:text-gray-500"
            />
          </div>
          <MDEditor.Markdown
            source={value}
            style={{ whiteSpace: 'pre-wrap' }}
            className="p-4 rounded-b-xl"
          />
        </div>
      </div>
      <div className="flex flex-col items-center bg-slate-100 rounded-xl p-2 mt-5">
        <span className="text-lg font-semibold mb-2">Create Email</span>
        <form
          className="w-full flex flex-row items-start"
          onSubmit={(e) => {
            e.preventDefault();
            if (email === '') return;
            if (users.some((user) => user === email)) {
              setEmailError('Email already exists!');
              setTimeout(() => {
                setEmailError('');
              }, 5000);
            } else {
              setUsers([...users, email]);
              setEmail('');
            }
          }}>
          <div className="w-full flex flex-col">
            <input
              type="email"
              id="user-email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500"
            />
            <label htmlFor="user-email" className="text-red-500 text-sm font-semibold mt-2">
              {emailError}
            </label>
          </div>
          <button
            type="submit"
            className="w-40 ml-2 p-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all duration-150">
            Add
          </button>
        </form>
        <textarea
          name="mailbody"
          id="mailbody"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter Email Body..."
          className="w-full p-2.5 h-auto min-h-60 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500 mt-2"
        />
        {/* <MDEditor value={value} onChange={setValue} data-color-mode="light" className="w-full" /> */}
      </div>
    </div>
  );
}

export default SendInvitationPage;
