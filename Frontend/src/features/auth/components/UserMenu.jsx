import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from "../hook/useAuth";
import { useNavigate } from 'react-router';

const UserMenu = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { handleLogout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogoutClick = async () => {
        const success = await handleLogout();
        if (success) {
            setIsOpen(false);
            navigate('/login');
        }
    };

    return (
        <div ref={menuRef} className="relative">
            {/* Username button - clickable */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer hover:text-[#C9A96E] transition-colors"
                style={{ color: '#1b1c1a' }}
            >
                {user.fullname}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-2 bg-white border shadow-md z-50"
                    style={{ borderColor: '#e4e2df', minWidth: '150px' }}
                >
                    {/* Role badge */}
                    <div
                        className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border-b"
                        style={{ color: '#7A6E63', borderColor: '#e4e2df' }}
                    >
                        {user.role}
                    </div>

                    {/* User info */}
                    <div className="px-4 py-3">
                        <p className="text-[12px] font-medium" style={{ color: '#1b1c1a' }}>
                            {user.fullname}
                        </p>
                        <p className="text-[11px]" style={{ color: '#7A6E63' }}>
                            {user.email}
                        </p>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: '#e4e2df' }} />

                    {/* Logout button */}
                    <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-3 text-[12px] uppercase tracking-[0.2em] font-medium transition-colors hover:bg-[#fbf9f6]"
                        style={{ color: '#C9A96E' }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
