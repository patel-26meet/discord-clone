import qs from "query-string";
import { useInfiniteQuery, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
}

interface MessageResponse {
    pages: any;
    messages: any[]; // Replace 'any' with your message type
    nextCursor: string | undefined;
}

export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue 
}: ChatQueryProps): UseInfiniteQueryResult<MessageResponse, Error> => {
    const { isConnected } = useSocket();

    const fetchMessages = async ({ pageParam = undefined }): Promise<MessageResponse> => {
        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                cursor: pageParam,
                [paramKey]: paramValue,   
            }
        }, { skipNull: true });

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Failed to fetch messages');
        }
        return res.json();
    };

    return useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchInterval: isConnected ? false : 5000, // Adjusted to 5 seconds
    });
}