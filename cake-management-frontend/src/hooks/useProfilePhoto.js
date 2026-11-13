import { useEffect, useState } from "react";
import profileService from "../services/profileService";

export const PROFILE_PHOTO_EVENT = "profile-photo-changed";

// Call this after a photo is uploaded (pass the new URL) or removed (pass nothing)
export const notifyProfilePhotoChanged = (url) =>
    window.dispatchEvent(
        new CustomEvent(PROFILE_PHOTO_EVENT, { detail: url || null })
    );

export default function useProfilePhoto() {
    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
    const [photo, setPhoto] = useState(null);

    // Load the photo on login, clear it on logout, and listen for upload/remove
    useEffect(() => {
        if (!token) {
            setPhoto(null);
            return;
        }

        let cancelled = false;

        profileService
            .getMyProfile()
            .then((data) => {
                if (!cancelled) setPhoto(data.profileImageUrl || null);
            })
            .catch(() => {
                // Never break the page if the photo fails to load
            });

        const onChanged = (e) => setPhoto(e.detail || null);
        window.addEventListener(PROFILE_PHOTO_EVENT, onChanged);

        return () => {
            cancelled = true;
            window.removeEventListener(PROFILE_PHOTO_EVENT, onChanged);
        };
    }, [token]);

    return photo;
}