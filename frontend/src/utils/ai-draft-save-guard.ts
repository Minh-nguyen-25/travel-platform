export interface DraftSaveRequest {
  generation: number;
  requestId: number;
}

export const createDraftSaveGuard = () => {
  let generation = 0;
  let nextRequestId = 0;
  let activeRequest: DraftSaveRequest | null = null;

  const isCurrent = (request: DraftSaveRequest): boolean => (
    activeRequest === request && request.generation === generation
  );

  return {
    begin(): DraftSaveRequest | null {
      if (activeRequest) return null;
      const request = { generation, requestId: nextRequestId += 1 };
      activeRequest = request;
      return request;
    },
    complete(request: DraftSaveRequest): boolean {
      if (!isCurrent(request)) return false;
      activeRequest = null;
      return true;
    },
    isCurrent,
    reset(): void {
      generation += 1;
      activeRequest = null;
    },
  };
};
