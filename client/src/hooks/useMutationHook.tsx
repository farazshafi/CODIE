import { useState } from "react";
import { toast } from "sonner";

type Options = {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: any, variable?: any) => void;
    onError?: (error: any) => void;
};

export const useMutationHook = (
    apiFunction: (data: any) => Promise<any>,
    options?: Options
) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    const mutate = async (inputData: any) => {
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
        } catch (err: any) {
            setError(err);
            setIsError(true);

            options?.onError?.(err);
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
};
