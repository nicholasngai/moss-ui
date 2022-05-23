export type MossResults = {
  files: {
    [path: string]: {
      content: string;
    };
  };
  matches: {
    path: string;
    start: number;
    end: number;
  }[][];
};

export function isMossResults(data: unknown): data is MossResults {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const record = data as Record<string, unknown>;
  if (
    !record.files ||
    typeof record.files !== 'object' ||
    Object.values(record.files).some((file) => {
      if (!file || typeof file !== 'object') {
        return true;
      }
      const fileRecord = file as Record<string, unknown>;
      if (typeof fileRecord.content !== 'string') {
        return true;
      }
      return false;
    }) ||
    !(record.matches instanceof Array) ||
    record.matches.some(
      (match: unknown) =>
        !(match instanceof Array) ||
        match.some((entry) => {
          if (!entry || typeof entry !== 'object') {
            return true;
          }
          const entryRecord = entry as Record<string, unknown>;
          if (
            typeof entryRecord.path !== 'string' ||
            typeof entryRecord.start !== 'number' ||
            typeof entryRecord.end !== 'number'
          ) {
            return true;
          }
          return false;
        }),
    )
  ) {
    return false;
  }
  return true;
}
