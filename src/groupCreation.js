// import React, { useState, useEffect } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, FormControlLabel, List, ListItem } from '@mui/material';

// const GroupCreationButton = ({ users, onCreateGroup }) => {
//     const [open, setOpen] = useState(false);
//     const [groupName, setGroupName] = useState('');
//     const [selectedUsers, setSelectedUsers] = useState({});

//     const handleClickOpen = () => {
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//     };

//     const handleGroupNameChange = (event) => {
//         setGroupName(event.target.value);
//     };

//     const handleToggleUser = (userId) => {
//         setSelectedUsers((prevSelectedUsers) => ({
//             ...prevSelectedUsers,
//             [userId]: !prevSelectedUsers[userId],
//         }));
//     };

//     const handleCreateGroup = () => {
//         const selectedUserIds = Object.keys(selectedUsers).filter((userId) => selectedUsers[userId]);
//         onCreateGroup(groupName, selectedUserIds);
//         setOpen(false);
//         setGroupName('');
//         setSelectedUsers({});
//     };

//     // Example useEffect: Reset form state when dialog is closed
//     useEffect(() => {
//         if (!open) {
//             setGroupName('');
//             setSelectedUsers({});
//         }
//     }, [open]);

//     return (
//         <>
//             <Button variant="outlined" onClick={handleClickOpen}>
//                 Create Group
//             </Button>
//             <Dialog open={open} onClose={handleClose}>
//                 <DialogTitle>Create New Group</DialogTitle>
//                 <DialogContent>
//                     <TextField
//                         autoFocus
//                         margin="dense"
//                         id="name"
//                         label="Group Name"
//                         type="text"
//                         fullWidth
//                         variant="standard"
//                         value={groupName}
//                         onChange={handleGroupNameChange}
//                     />
//                     <List>
//                         {users.map((user) => (
//                             <ListItem key={user.id}>
//                                 <FormControlLabel
//                                     control={
//                                         <Checkbox
//                                             checked={!!selectedUsers[user.id]}
//                                             onChange={() => handleToggleUser(user.id)}
//                                         />
//                                     }
//                                     label={user.username}
//                                 />
//                             </ListItem>
//                         ))}
//                     </List>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose}>Cancel</Button>
//                     <Button onClick={handleCreateGroup}>Create</Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// };

// export default GroupCreationButton;

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

const GroupDialog = ({ open, onClose, users, onCreateGroup }) => {
  const [selectedUsers, setSelectedUsers] = useState({});

  const handleToggle = (userId) => {
    setSelectedUsers((prevSelectedUsers) => ({
      ...prevSelectedUsers,
      [userId]: !prevSelectedUsers[userId],
    }));
  };

  const handleCreateClick = () => {
    // Collect user IDs of selected users
    const selectedUserIds = Object.keys(selectedUsers).filter(
      (userId) => selectedUsers[userId]
    );
    // Call the onCreateGroup function passed as a prop
    onCreateGroup(selectedUserIds);
    // Reset selected users and close the dialog
    setSelectedUsers({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <List>
          {users.map((user) => (
            <ListItem key={user.id} button onClick={() => handleToggle(user.id)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!selectedUsers[user.id]}
                    onChange={() => handleToggle(user.id)}
                  />
                }
                label={user.username}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateClick} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupDialog;
