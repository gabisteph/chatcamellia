import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel } from '@mui/material';

const GroupCreation = ({ users, onCreateGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState({});

    const handleToggleUser = (userId) => {
        setSelectedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const handleGroupNameChange = (event) => {
        setGroupName(event.target.value);
    };

    const handleSubmit = () => {
        const selectedUserIds = Object.keys(selectedUsers).filter(userId => selectedUsers[userId]);
        if (!groupName || selectedUserIds.length < 2) {
            alert('Please provide a group name and select at least two users.');
            return;
        }
        onCreateGroup(groupName, selectedUserIds);
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6">Create New Group</Typography>
            <TextField
                fullWidth
                label="Group Name"
                value={groupName}
                onChange={handleGroupNameChange}
                margin="normal"
            />
            <Box sx={{ maxHeight: 300, overflowY: 'auto', marginTop: 1 }}>
                {users.map(user => (
                    <FormControlLabel
                        key={user.id}
                        control={
                            <Checkbox
                                checked={!!selectedUsers[user.id]}
                                onChange={() => handleToggleUser(user.id)}
                            />
                        }
                        label={user.username}
                    />
                ))}
            </Box>
            <Button variant="contained" onClick={handleSubmit} sx={{ marginTop: 2 }}>
                Create Group
            </Button>
        </Box>
    );
};

export default GroupCreation;
