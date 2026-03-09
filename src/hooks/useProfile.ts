import { useState, useEffect } from "react";
import { api } from "@/services/api";

export interface ProfessorProfile {
    name: string;
    email: string;
    phone: string;
    emailNotifications: boolean;
    lowCreditAlerts: boolean;
    missedClassAlerts: boolean;
    paymentAlerts: boolean;
}

export function useProfile() {
    const [profile, setProfile] = useState<ProfessorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const response = await api.get<ProfessorProfile>("/professors/me");
            setProfile({
                ...response.data,
                phone: response.data.phone || "",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const updateProfile = async (data: Partial<ProfessorProfile>) => {
        try {
            const response = await api.put<ProfessorProfile>("/professors/me", data);
            setProfile(response.data);
            return true;
        } catch (error) {
            return false;
        }
    };

    const deleteAccount = async () => {
        try {
            await api.delete("/professors/me");
            return true;
        } catch (error) {
            return false;
        }
    };

    return { profile, isLoading, updateProfile, deleteAccount };
}