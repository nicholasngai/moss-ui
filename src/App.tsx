import React from 'react';
import MossImporter from './components/MossImporter';
import { MossResults } from './types';

export type AppProps = Record<string, never>;

function computeMatchKey(path1: string, path2: string): string {
  if (path1.includes(':') || path2.includes(':')) {
    throw new Error("Can't compute the match key of a path including a colon");
  }
  if (path1 < path2) {
    return `${path1}:${path2}`;
  } else {
    return `${path2}:${path1}`;
  }
}

type Segment = {
  start: number;
  end: number;
};

type Match = {
  file1: Segment;
  file2: Segment;
};

type AppState =
  | {
      mossResults: MossResults;
      matches: Record<string, Match[]>;
    }
  | {
      mossResults?: undefined;
      matches?: undefined;
    };

class App extends React.PureComponent<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {};
  }

  private handleMossResults = (results: MossResults) => {
    /* Compute pairwise matches without coalescing. */
    const matches: Record<string, Match[]> = {};
    for (const matchList of results.matches) {
      const files: Record<string, Segment[]> = {};
      for (const match of matchList) {
        if (!(match.path in files)) {
          files[match.path] = [];
        }
        files[match.path]!.push({
          start: match.start,
          end: match.end,
        });
      }

      const filesKeys = Object.keys(files);
      for (let i = 0; i < filesKeys.length; i++) {
        for (let j = i + 1; j < filesKeys.length; j++) {
          const path1 = filesKeys[i]!;
          const path2 = filesKeys[j]!;
          const matchKey = computeMatchKey(path1, path2);

          if (!(matchKey in matches)) {
            matches[matchKey] = [];
          }
          const file1 = files[path1]!;
          const file2 = files[path2]!;
          for (const file1Match of file1) {
            for (const file2Match of file2) {
              matches[matchKey]!.push({ file1: file1Match, file2: file2Match });
            }
          }
        }
      }
    }

    /* Attempt to coalesce matches by finding overlapping start and end
     * positions. */
    const combinedMatches: Record<string, Match[]> = {};
    for (const [matchKey, matchList] of Object.entries(matches)) {
      const combinedMatchList: Match[] = [];

      matchList.sort((a, b) => a.file1.start - b.file1.start);

      let curCombinedMatch: Match = {
        ...matchList[0],
        file1: {
          ...matchList[0]!.file1,
        },
        file2: {
          ...matchList[0]!.file2,
        },
      };

      for (const match of matchList) {
        if (match.file1.start <= curCombinedMatch.file1.end && match.file2.start <= curCombinedMatch.file2.end) {
          curCombinedMatch.file1.end = Math.max(match.file1.end, curCombinedMatch.file1.end);
          curCombinedMatch.file2.end = Math.max(match.file2.end, curCombinedMatch.file2.end);
        } else {
          combinedMatchList.push(curCombinedMatch);
          curCombinedMatch = {
            ...match,
            file1: { ...match.file1 },
            file2: { ...match.file2 },
          };
        }
      }

      combinedMatches[matchKey] = combinedMatchList;
    }

    this.setState({
      mossResults: results,
      matches: combinedMatches,
    });
  };

  override render() {
    return (
      <div className="App">
        <MossImporter onImport={this.handleMossResults} />
        {this.state.mossResults ? JSON.stringify(this.state.mossResults.matches) : null}
      </div>
    );
  }
}

export default App;
