"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type ModalType = "auth" | "plan_selection" | "username_setup" | "settings" | "billing" | null;

interface ModalContextType {
    openModal: (type: ModalType) => void;
    closeModal: () => void;
    modalType: ModalType;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalType, setModalType] = useState<ModalType>(null);

    function openModal(type: ModalType) {
        setModalType(type);
    }

    function closeModal() {
        setModalType(null);
    }

    return (
        <ModalContext.Provider value={{ openModal, closeModal, modalType }}>
            {children}
            <AnimatePresence>
                {modalType && (
                    <ModalOverlay onClose={closeModal}>
                        <ModalContent type={modalType} onClose={closeModal} />
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
}

function ModalOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            {children}
        </motion.div>
    )
}

// Placeholder for content specific logic - to be replaced by actual AuthModal imports
import { AuthModalContent } from "@/components/auth/auth-modal";

function ModalContent({ type, onClose }: { type: ModalType; onClose: () => void }) {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            {type !== "username_setup" && (
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition-colors z-20">
                    <X size={20} />
                </button>
            )}

            {type === "auth" && <AuthModalContent view="auth" />}
            {type === "plan_selection" && <AuthModalContent view="plan" />}
            {type === "username_setup" && <AuthModalContent view="username" />}
            {type === "settings" && <AuthModalContent view="settings" />}
            {type === "billing" && <AuthModalContent view="billing" />}
        </motion.div>
    )
}


export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
