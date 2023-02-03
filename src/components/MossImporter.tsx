import React from 'react';
import { isMossResults, MossResults } from '../types';

export type MossImporterProps = {
  onImport: (results: MossResults) => void;
};

type MossImporterState = {
  file?: File;
  loading: boolean;
  error?: string;
};

class MossImporter extends React.PureComponent<MossImporterProps, MossImporterState> {
  constructor(props: MossImporterProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  private handleFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      file: e.target.files![0],
    });
  };

  private handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = await this.state.file!.text();

    await this.setState({
      loading: true,
      error: undefined,
    });

    try {
      const data: MossResults = JSON.parse(text);
      if (!isMossResults(data)) {
        this.setState({
          loading: false,
          error: 'Not a valid Moss results file',
        });
      }
      this.props.onImport(data);
      this.setState({
        loading: false,
      });
    } catch (e: unknown) {
      this.setState({
        loading: false,
        error: 'Not a valid Moss results file',
      });
    }
  };

  override render() {
    return (
      <div className="MossImporter">
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="MossImporter__results">Upload Results</label>
          <br />
          <input id="MossImporter__results" name="results" type="file" onChange={this.handleFileUpdate} />
          <br />
          <button type="submit" disabled={!this.state.file || this.state.loading}>
            {this.state.loading ? 'Loading...' : 'Analyze'}
          </button>
          {this.state.error ? (
            <>
              <br />
              <span className="error">{this.state.error}</span>
            </>
          ) : null}
        </form>
      </div>
    );
  }
}

export default MossImporter;
