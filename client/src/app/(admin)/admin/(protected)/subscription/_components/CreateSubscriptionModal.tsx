'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubscription } from '@/lib/validations/subscriptionValidation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutationHook } from '@/hooks/useMutationHook';
import { createSubscriptionApi } from '@/apis/subscriptionApi';
import { toast } from 'sonner';

type CreateSubscriptionType = z.infer<typeof createSubscription>;

export default function CreateSubscriptionModal({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate(): void }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateSubscriptionType>({
        resolver: zodResolver(createSubscription),
    })

    const { mutate: createSubscriptionMutate } = useMutationHook(createSubscriptionApi, {
        onSuccess(response) {
            toast.success(response.message)
            onCreate()
        }
    })

    const onSubmit = (data: CreateSubscriptionType) => {
        console.log('Submitted data:', data)
        createSubscriptionMutate(data)
        onClose()
        reset()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Subscription</DialogTitle>
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
