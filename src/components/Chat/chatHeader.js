import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useUserChat } from '../../contexts/useUserChat'

export const ChatHeader = () => {
    const { username } = useUserChat()

    if (!username) return null
    return (
        <div
            style={{
                width: '100%',
                height: '60px',
                background: 'rgb(156, 111, 228)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '16px',
                boxSizing: 'border-box',
                marginBottom: '8px'
            }}
        >
            <AccountCircleIcon
                sx={{ fontSize: 38, color: 'white', marginRight: '8px' }}
            />
            <span
                style={{
                    fontFamily: 'Poppins',
                    color: 'white',
                    fontSize: '24px',
                }}
            >
                {username}
            </span>
        </div>
    )
}
