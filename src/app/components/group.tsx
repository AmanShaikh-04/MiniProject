"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/app/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

type Member = {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  branch: string;
  profilePhoto: string;
  leader?: boolean;
};

type UserProfile = {
  firstName: string;
  lastName: string;
  rollNo: string;
  branch: string;
  profilePhoto: string;
};

const Group: React.FC = () => {
  const router = useRouter();
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const viewModalRef = useRef<HTMLDivElement>(null);
  const joinModalRef = useRef<HTMLDivElement>(null);
  const leaveModalRef = useRef<HTMLDivElement>(null);

  // Fetch user profile data
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, "student", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile;
        setUserProfile(userData);
        return userData;
      } else {
        console.log("No user profile found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Updated fetchGroupData:
  // 1. First try to get the group reference from the student's subcollection "groups".
  // 2. If not available, fallback to querying the global "groups" collection for a document
  //    where the current user is the creator (i.e. leader).
  const fetchGroupData = async () => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    // Fetch the user's profile data
    await fetchUserProfile(auth.currentUser.uid);

    try {
      let groupId: string | null = null;

      // First try: student's subcollection groups
      const studentGroupRef = collection(
        db,
        "student",
        auth.currentUser.uid,
        "groups",
      );
      const studentGroupSnapshot = await getDocs(studentGroupRef);
      if (!studentGroupSnapshot.empty) {
        // Use the first group reference from the student document.
        groupId = studentGroupSnapshot.docs[0].id;
      } else {
        // Fallback: query global groups where current user is the creator (group leader)
        const groupsQuery = query(
          collection(db, "groups"),
          where("createdBy", "==", auth.currentUser.uid),
        );
        const groupsSnapshot = await getDocs(groupsQuery);
        if (!groupsSnapshot.empty) {
          groupId = groupsSnapshot.docs[0].id;
        }
      }

      if (groupId) {
        setGroupCode(groupId);

        // Fetch members from the group's members subcollection
        const groupMembersRef = collection(db, "groups", groupId, "members");
        const membersSnapshot = await getDocs(groupMembersRef);
        const membersData: Member[] = membersSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Member, "id">),
        }));
        setMembers(membersData);

        // Check if the current user is flagged as leader in the group's member documents
        const leaderMember = membersData.find((member) => member.leader);
        setIsLeader(leaderMember?.uid === auth.currentUser.uid);
      } else {
        // No group found for the user
        setGroupCode(null);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching group data: ", error);
    }
    setIsLoading(false);
  };

  // Set persistence and watch for auth state changes.
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            fetchGroupData();
          } else {
            setIsLoading(false);
          }
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting auth persistence", error);
      });
  }, [refreshFlag]);

  // Modal dismissal for "View All" modal.
  useEffect(() => {
    const handleClickOutsideView = (event: MouseEvent) => {
      if (
        viewModalRef.current &&
        !viewModalRef.current.contains(event.target as Node)
      ) {
        setShowViewAllModal(false);
      }
    };
    const handleEscKeyView = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowViewAllModal(false);
      }
    };
    if (showViewAllModal) {
      document.addEventListener("mousedown", handleClickOutsideView);
      document.addEventListener("keydown", handleEscKeyView);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideView);
      document.removeEventListener("keydown", handleEscKeyView);
    };
  }, [showViewAllModal]);

  // Modal dismissal for "Join Group" modal.
  useEffect(() => {
    const handleClickOutsideJoin = (event: MouseEvent) => {
      if (
        joinModalRef.current &&
        !joinModalRef.current.contains(event.target as Node)
      ) {
        setShowJoinModal(false);
      }
    };
    const handleEscKeyJoin = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowJoinModal(false);
      }
    };
    if (showJoinModal) {
      document.addEventListener("mousedown", handleClickOutsideJoin);
      document.addEventListener("keydown", handleEscKeyJoin);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideJoin);
      document.removeEventListener("keydown", handleEscKeyJoin);
    };
  }, [showJoinModal]);

  // Modal dismissal for "Leave Group" modal.
  useEffect(() => {
    const handleClickOutsideLeave = (event: MouseEvent) => {
      if (
        leaveModalRef.current &&
        !leaveModalRef.current.contains(event.target as Node)
      ) {
        setShowLeaveModal(false);
      }
    };
    const handleEscKeyLeave = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowLeaveModal(false);
      }
    };
    if (showLeaveModal) {
      document.addEventListener("mousedown", handleClickOutsideLeave);
      document.addEventListener("keydown", handleEscKeyLeave);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLeave);
      document.removeEventListener("keydown", handleEscKeyLeave);
    };
  }, [showLeaveModal]);

  // Handler for member removal by the leader
  const handleRemoveMember = async (memberId: string, memberUid: string) => {
    if (!auth.currentUser || !groupCode) return;

    try {
      // Delete the member document from the group's members subcollection
      await deleteDoc(doc(db, "groups", groupCode, "members", memberId));

      // Delete the group reference from the student's groups subcollection
      await deleteDoc(doc(db, "student", memberUid, "groups", groupCode));

      // Update the local state to reflect the change
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId),
      );

      console.log(`Member with ID: ${memberId} removed from group`);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("An error occurred while removing the member.");
    }
  };

  const handleLeaveGroup = () => {
    setShowLeaveModal(true);
  };

  const handleJoinGroup = () => {
    setShowJoinModal(true);
  };

  // Handle leaving the group
  const handleLeaveGroupConfirm = async () => {
    if (!auth.currentUser || !groupCode) return;

    try {
      // If the current user is the leader and there are other members, cannot leave without transferring leadership
      if (isLeader && members.length > 1) {
        alert(
          "As the leader, you cannot leave the group without transferring leadership first.",
        );
        setShowLeaveModal(false);
        return;
      }

      // Delete the member document from the group's members subcollection
      await deleteDoc(
        doc(db, "groups", groupCode, "members", auth.currentUser.uid),
      );

      // Delete the group reference from the student's groups subcollection
      await deleteDoc(
        doc(db, "student", auth.currentUser.uid, "groups", groupCode),
      );

      // If the user is the leader and the only member, delete the entire group
      if (isLeader && members.length <= 1) {
        await deleteDoc(doc(db, "groups", groupCode));
      }

      // Reset local state
      setGroupCode(null);
      setMembers([]);
      setIsLeader(false);
      setShowLeaveModal(false);

      console.log("Successfully left the group");
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("An error occurred while leaving the group.");
    }
  };

  // Handle join group submission.
  const handleJoinGroupSubmit = async () => {
    if (!auth.currentUser) return;
    if (!joinCode || joinCode.length !== 6) {
      alert("Please enter a valid 6-letter code.");
      return;
    }

    try {
      // Check if user already belongs to a group
      const userGroupsRef = collection(
        db,
        "student",
        auth.currentUser.uid,
        "groups",
      );
      const userGroupsSnapshot = await getDocs(userGroupsRef);

      if (!userGroupsSnapshot.empty) {
        alert(
          "You already belong to a group. Please leave your current group before joining a new one.",
        );
        setShowJoinModal(false);
        return;
      }

      // Query the global "groups" collection using the field "code".
      const groupsQuery = query(
        collection(db, "groups"),
        where("code", "==", joinCode),
      );
      const groupsSnapshot = await getDocs(groupsQuery);

      if (!groupsSnapshot.empty) {
        const joinDoc = groupsSnapshot.docs[0];
        const groupId = joinDoc.id;

        // Get user's profile data to store in the group
        let profileData = userProfile;

        if (!profileData) {
          profileData = await fetchUserProfile(auth.currentUser.uid);
        }

        if (!profileData) {
          alert(
            "Could not retrieve your profile information. Please try again later.",
          );
          return;
        }

        const memberData = {
          uid: auth.currentUser.uid,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          rollNo: profileData.rollNo,
          branch: profileData.branch,
          profilePhoto:
            profileData.profilePhoto || "https://via.placeholder.com/150",
          leader: false,
          joinedAt: new Date(),
        };

        // Write the member document into the group's "members" subcollection.
        await setDoc(
          doc(db, "groups", groupId, "members", auth.currentUser.uid),
          memberData,
        );
        console.log("Member added:", memberData);

        // Also add group reference in student's "groups" subcollection.
        await setDoc(
          doc(db, "student", auth.currentUser.uid, "groups", groupId),
          {
            code: joinCode,
            createdBy: joinDoc.data().createdBy,
          },
        );

        setJoinCode("");
        setShowJoinModal(false);
        setIsLoading(true);
        setRefreshFlag((prev) => prev + 1);
      } else {
        alert("Group not found with the provided 6-letter code.");
      }
    } catch (error) {
      console.error("Error joining group: ", error);
      alert("An error occurred while trying to join the group.");
    }
  };

  // Determine leader from the fetched members.
  const leaderMember = members.find((member) => member.leader);

  // Create a filtered array of non-leader members.
  const nonLeaderMembers = members.filter((member) => !member.leader);
  const hasMoreMembers = nonLeaderMembers.length > 4;

  if (isLoading || !auth.currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl border border-amber-100 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          My Group:
          <span className="ml-2 font-mono bg-amber-50 px-3 py-1 rounded-lg text-amber-800 text-xl">
            {groupCode ? groupCode.substring(0, 6).toUpperCase() : "NO GROUP"}
          </span>
        </h2>
        {groupCode ? (
          // If group exists, show the Leave Group button and if the current user is the leader
          // and no non-leader member exists, also show the Join Group button.
          <div className="flex gap-3">
            <button
              onClick={handleLeaveGroup}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-95"
              aria-label="Leave Group"
            >
              Leave Group
            </button>
            {isLeader && nonLeaderMembers.length === 0 && (
              <button
                onClick={handleJoinGroup}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-95"
                aria-label="Join Group"
              >
                Join Group
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleJoinGroup}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-95"
            aria-label="Join Group"
          >
            Join Group
          </button>
        )}
      </div>

      {/* Leader Card */}
      {leaderMember && (
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Group Leader
          </h3>
          <div className="p-4 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-200 shadow-sm flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-amber-300 shadow-sm">
              <img
                src={leaderMember.profilePhoto}
                alt={`${leaderMember.firstName} ${leaderMember.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {leaderMember.firstName} {leaderMember.lastName}
              </p>
              <p className="text-gray-600">Roll No: {leaderMember.rollNo}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                Leader
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Group Members Display */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Group Members
        </h3>
        {nonLeaderMembers.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 italic">No members in the group yet.</p>
            <button
              onClick={handleJoinGroup}
              className="mt-3 text-amber-600 hover:text-amber-800 font-medium underline text-sm"
            >
              Join a group to get started
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {nonLeaderMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                >
                  {isLeader &&
                    auth.currentUser &&
                    member.uid !== auth.currentUser.uid && (
                      <button
                        onClick={() =>
                          handleRemoveMember(member.id, member.uid)
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                        aria-label={`Remove ${member.firstName} ${member.lastName}`}
                      >
                        <span className="sr-only">Remove member</span>
                        <span aria-hidden="true">–</span>
                      </button>
                    )}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-amber-50 mb-3 overflow-hidden border-2 border-amber-100 shadow-sm transform transition-transform group-hover:scale-105">
                      <img
                        src={member.profilePhoto}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-gray-500 text-sm">{member.rollNo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hasMoreMembers && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowViewAllModal(true)}
                  className="text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1 focus:outline-none hover:underline transition-colors"
                  aria-label="View all group members"
                >
                  View All
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* "View All" Modal */}
      {showViewAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={viewModalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex justify-between items-center border-b p-5 bg-gradient-to-r from-amber-50 to-white">
              <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                All Group Members
              </h3>
              <button
                onClick={() => setShowViewAllModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-grow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    {isLeader && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-amber-200">
                          <img
                            src={member.profilePhoto}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {member.firstName} {member.lastName}
                        {member.leader && (
                          <span className="ml-2 text-xs font-medium bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                            Leader
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.branch}
                      </td>
                      {isLeader &&
                        auth.currentUser &&
                        member.uid !== auth.currentUser.uid && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() =>
                                handleRemoveMember(member.id, member.uid)
                              }
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded-full transition-colors"
                              aria-label={`Remove ${member.firstName} ${member.lastName}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t p-4 flex justify-end bg-gray-50">
              <button
                onClick={() => setShowViewAllModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Join Group" Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={joinModalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-modal-title"
          >
            <div className="p-5 bg-gradient-to-r from-amber-50 to-white border-b">
              <h3
                id="join-modal-title"
                className="text-xl font-bold text-gray-900"
              >
                Join a Group
              </h3>
            </div>
            <div className="p-5">
              <label
                htmlFor="group-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter 6-Letter Group Code
              </label>
              <input
                id="group-code"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-center text-xl font-mono tracking-wider uppercase focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all"
                placeholder="ABCDEF"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinGroupSubmit}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all active:scale-95"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Leave Group" Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={leaveModalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-modal-title"
          >
            <div className="p-5 bg-gradient-to-r from-red-50 to-white border-b">
              <h3
                id="leave-modal-title"
                className="text-xl font-bold text-gray-900"
              >
                Leave Group?
              </h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700 mb-4">
                Are you sure you want to leave this group?{" "}
                {isLeader && members.length > 1
                  ? "As the leader, you cannot leave while other members are still in the group."
                  : "This action cannot be undone."}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveGroupConfirm}
                  className={`px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 transition-all active:scale-95 ${
                    isLeader && members.length > 1
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isLeader && members.length > 1}
                >
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Group;
