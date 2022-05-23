import React from 'react';
import MossImporter from './components/MossImporter';
import { MossResults } from './types';

export type AppProps = Record<string, never>;

type AppState = {
  mossResults?: MossResults;
};

class App extends React.PureComponent<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {};
  }

  private handleMossResults = (results: MossResults) => {
    this.setState({
      mossResults: results,
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
