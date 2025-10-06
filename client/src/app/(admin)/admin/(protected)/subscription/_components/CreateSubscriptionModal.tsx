'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubscription } from '@/lib/validations/subscriptionValidation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutationHook } from '@/hooks/useMutationHook';
import { createSubscriptionApi, editSubscriptionApi } from '@/apis/subscriptionApi';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ApiError extends Error {
    response?: {
        data?: {
            errors?: { message: string }[];
            message?: string;
        };
    };
}

export type CreateSubscriptionType = z.infer<typeof createSubscription>;

export default function CreateSubscriptionModal({
    isOpen,
    onClose,
    onCreate,
    editData
}: {
    isOpen: boolean,
    onClose: () => void,
    onCreate(): void,
    editData: (CreateSubscriptionType & { _id: string }) | null
}) {

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateSubscriptionType>({
        resolver: zodResolver(createSubscription),
    })
    const router = useRouter()

    const { mutate: createSubscriptionMutate } = useMutationHook(createSubscriptionApi, {
        onSuccess(response) {
            toast.success(response.message)
            onCreate()
            onClose();
            reset();
        },
        onError: (e: ApiError) => {
            const errors = e?.response?.data?.errors;
            let message = "Login failed";
            if (Array.isArray(errors)) {
                message = errors.map(err => err.message).join("\n");
            } else if (e?.response?.data?.message) {
                message = e.response.data.message;
            }

            toast.error(message);
        }
    })

    const { mutate: editSubscriptionMutate } = useMutationHook(editSubscriptionApi, {
        onSuccess(response) {
            toast.success(response.message);
            onCreate();
            onClose();
            reset();
            router.push('/admin/subscription');
        },
        onError: (e: ApiError) => {
            const errors = e?.response?.data?.errors;
            let message = "Login failed";
            if (Array.isArray(errors)) {
                message = errors.map(err => err.message).join("\n");
            } else if (e?.response?.data?.message) {
                message = e.response.data.message;
            }

            toast.error(message);
        }
    });

    const onSubmit = (data: CreateSubscriptionType) => {
        if (editData) {
            console.log("Editing subscription with data:", data);
            editSubscriptionMutate({ id: editData._id, data });
        } else {
            createSubscriptionMutate(data);
        }

    };

    //useeffect
    useEffect(() => {
        if (editData) {
            reset(editData);
        } else {
            reset();
        }
    }, [editData, reset]);


    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editData ? "Edit Subscription" : "Create Subscription"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label>Name:</label>
                        <select {...register('name')} className="input">
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                            <option value="Team">Team</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                        <p className="text-red-500 text-sm">{errors.name?.message}</p>
                    </div>

                    <div>
                        <label>Price per month:</label>
                        <input type="number" {...register('pricePerMonth', { valueAsNumber: true })} className="input" />
                        <p className="text-red-500 text-sm">{errors.pricePerMonth?.message}</p>
                    </div>

                    <div>
                        <label>Max Private Projects:</label>
                        <input type="number" {...register('maxPrivateProjects', { valueAsNumber: true })} className="input" />
                        <p className="text-red-500 text-sm">{errors.maxPrivateProjects?.message}</p>
                    </div>

                    <div>
                        <label>Max Collaborators:</label>
                        <input type="number" {...register('maxCollaborators', { valueAsNumber: true })} className="input" />
                        <p className="text-red-500 text-sm">{errors.maxCollaborators?.message}</p>
                    </div>

                    {/* Chat Support */}
                    <div className="flex gap-4">
                        <label>Chat Support:</label>
                        <label><input type="checkbox" {...register('chatSupport.text')} /> Text</label>
                        <label><input type="checkbox" {...register('chatSupport.voice')} /> Voice</label>
                    </div>

                    {/* AI Feature */}
                    <div className="flex gap-4">
                        <label>AI Features:</label>
                        <label><input type="checkbox" {...register('aiFeature.codeSuggestion')} /> Suggestion</label>
                        <label><input type="checkbox" {...register('aiFeature.codeExplanation')} /> Explanation</label>
                    </div>

                    {/* Limits */}
                    <div>
                        <label>Executions Per Day:</label>
                        <input type="number" {...register('limits.codeExecutionsPerDay', { valueAsNumber: true })} className="input" />
                        <p className="text-red-500 text-sm">{errors.limits?.codeExecutionsPerDay?.message}</p>
                    </div>

                    <Button type="submit" className="w-full">Submit</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
