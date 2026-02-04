"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    Smile,
    MessageSquare,
    ChevronRight,
    ArrowLeft,
    ThumbsUp,
    AlertCircle,
    Stethoscope,
    Info,
    Coffee,
    User,
    Phone,
    Mail,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = {
    id: string;
    question: string;
    type: 'choice' | 'text' | 'contact' | 'success';
    options?: { value: string; label: string; icon: any }[];
    multiSelect?: boolean;
};

const STEPS: Step[] = [
    {
        id: 'type',
        question: '¡Hola! ¿Qué tipo de comentario deseas realizar hoy?',
        type: 'choice',
        options: [
            { value: 'Queja', label: 'Queja', icon: AlertCircle },
            { value: 'Sugerencia', label: 'Sugerencia', icon: MessageSquare },
            { value: 'Felicitación', label: 'Felicitación', icon: ThumbsUp },
        ]
    },
    {
        id: 'category',
        question: '¿Sobre qué área es tu comentario? (Puedes elegir varias)',
        type: 'choice',
        multiSelect: true,
        options: [
            { value: 'Confort', label: 'Confort', icon: Coffee },
            { value: 'Atención', label: 'Calidad de Atención', icon: Stethoscope },
            { value: 'Médicos', label: 'Cuerpo Médico', icon: User },
            { value: 'Limpieza', label: 'Servicios Básicos', icon: Info },
            { value: 'Otros', label: 'Otro', icon: MessageSquare },
        ]
    },
    {
        id: 'description',
        question: 'Cuéntanos un poco más sobre lo sucedido...',
        type: 'text',
    },
    {
        id: 'contact',
        question: '¿Deseas que te contactemos para dar seguimiento?',
        type: 'contact',
    },
    {
        id: 'success',
        question: '¡Gracias por tu opinión!',
        type: 'success',
    }
];

function SuccessScreen() {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.close();
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;text-align:center;padding:20px;"><div><h2>¡Gracias!</h2><p>Puedes cerrar esta pestaña.</p></div></div>';
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="text-center py-8">
            <div className="w-24 h-24 relative mx-auto mb-8">
                <Image
                    src="/logo-hsda.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-primary">¡Recibido con éxito!</h3>
            <p className="text-lg text-foreground/80 mb-4">
                Tus comentarios nos ayudan a mejorar la atención del Hospital San Diego de Alcalá.
            </p>
            <p className="text-base text-foreground/60 mb-8 animate-pulse">
                Esta ventana se cerrará automáticamente...
            </p>
            <p className="text-sm text-foreground/50">
                Si no se cierra, puedes cerrar esta pestaña manualmente.
            </p>
        </div>
    );
}

export default function ConversationalForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const step = STEPS[currentStep];

    const toggleOption = (value: string) => {
        if (selectedOptions.includes(value)) {
            setSelectedOptions(selectedOptions.filter(v => v !== value));
        } else {
            setSelectedOptions([...selectedOptions, value]);
        }
    };

    const handleNext = (value: any) => {
        const updatedData = { ...formData, [step.id]: value };
        setFormData(updatedData);
        setSelectedOptions([]);

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            const prevStep = STEPS[currentStep - 1];
            if (prevStep.multiSelect && formData[prevStep.id]) {
                setSelectedOptions(formData[prevStep.id]);
            } else {
                setSelectedOptions([]);
            }
        }
    };

    const submitForm = async () => {
        setIsSubmitting(true);

        const nameInput = document.querySelector('input[placeholder*="Nombre"]') as HTMLInputElement;
        const phoneInput = document.querySelector('input[placeholder*="Teléfono"]') as HTMLInputElement;
        const emailInput = document.querySelector('input[placeholder*="Email"]') as HTMLInputElement;

        const payload = {
            ...formData,
            category: Array.isArray(formData.category) ? formData.category.join(", ") : formData.category,
            contact: {
                name: nameInput?.value || "Anónimo",
                phone: phoneInput?.value || "N/A",
                email: emailInput?.value || "N/A",
            }
        };

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setCurrentStep(STEPS.length - 1);
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Error del servidor: ${errorData.error || response.statusText}`);
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            alert(`Error de conexión: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full"
                >
                    {currentStep > 0 && currentStep < STEPS.length - 1 && (
                        <button
                            onClick={handleBack}
                            className="mb-8 flex items-center text-secondary hover:text-primary transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Atrás
                        </button>
                    )}

                    <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative border-primary/10">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

                        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary leading-tight">
                            {step.question}
                        </h2>

                        {step.type === 'choice' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {step.options?.map((option) => {
                                        const isSelected = selectedOptions.includes(option.value);
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    if (step.multiSelect) {
                                                        toggleOption(option.value);
                                                    } else {
                                                        handleNext(option.value);
                                                    }
                                                }}
                                                className={cn(
                                                    "flex items-center p-6 rounded-2xl transition-all text-left group border",
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-lg scale-[1.02]"
                                                        : "bg-white/60 border-primary/10 hover:border-accent hover:bg-white hover:shadow-xl"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-transform group-hover:scale-110",
                                                    isSelected ? "bg-white/20" : "bg-accent/20"
                                                )}>
                                                    <option.icon className={cn("w-6 h-6", isSelected ? "text-white" : "text-primary")} />
                                                </div>
                                                <span className={cn("font-semibold text-lg", isSelected ? "text-white" : "text-foreground")}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {step.multiSelect && (
                                    <button
                                        disabled={selectedOptions.length === 0}
                                        onClick={() => handleNext(selectedOptions)}
                                        className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        Continuar
                                        <ChevronRight className="ml-2 w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {step.type === 'text' && (
                            <div className="space-y-4">
                                <textarea
                                    autoFocus
                                    className="w-full min-h-[150px] p-6 rounded-2xl bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg transition-all"
                                    placeholder="Aquí puedes escribir tus comentarios..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            handleNext((e.target as any).value);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => handleNext((document.querySelector('textarea') as any).value)}
                                    className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    Continuar
                                    <ChevronRight className="ml-2 w-5 h-5" />
                                </button>
                                <p className="text-sm text-secondary italic">Presiona Ctrl + Enter para continuar</p>
                            </div>
                        )}

                        {step.type === 'contact' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                        <input
                                            type="text"
                                            placeholder="Nombre completo (Opcional)"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-primary/10 bg-white/60 focus:ring-2 focus:ring-accent/50 outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                        <input
                                            type="tel"
                                            placeholder="Teléfono"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-primary/10 bg-white/60 focus:ring-2 focus:ring-accent/50 outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-primary/10 bg-white/60 focus:ring-2 focus:ring-accent/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        disabled={isSubmitting}
                                        onClick={submitForm}
                                        className="flex-1 py-5 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                        ) : (
                                            <>Enviar Comentario <ChevronRight className="ml-2 w-6 h-6" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}


                        {step.type === 'success' && (
                            <SuccessScreen />
                        )}

                    </div>

                    <div className="mt-8 flex justify-center gap-2">
                        {STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    idx <= currentStep ? "w-8 bg-primary" : "w-1.5 bg-primary/10"
                                )}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
