import { useState } from "react";
import { toast } from "sonner";

type Options<TData, TVariables, TError> = {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: TData, variables?: TVariables) => void;
    onError?: (error: TError) => void;
};

export function useMutationHook<TData, TVariables = void, TError = unknown>(
    apiFunction: (data: TVariables) => Promise<TData>,
    options?: Options<TData, TVariables, TError>
) {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [data, setData] = useState<TData | null>(null);
    const [error, setError] = useState<TError | null>(null);

    const mutate = async (inputData: TVariables) => {
        setIsLoading(true);
        setIsError(false);
        setIsSuccess(false);
        setData(null);
        setError(null);

        try {
            const response = await apiFunction(inputData);
            setData(response);
            setIsSuccess(true);

            if (options?.successMessage) {
                toast(options.successMessage);
            }

            options?.onSuccess?.(response, inputData);
        } catch (err) {
            setError(err as TError);
            setIsError(true);

            if (options?.errorMessage) {
                toast.error(options.errorMessage);
            }

            options?.onError?.(err as TError);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        mutate,
        isLoading,
        isError,
        isSuccess,
        data,
        error,
    };
}
