import React, { useState } from 'react';
import './App.css';
import { UsersView } from './views/users.view';
import { RepositoriesView } from './views/repositories.view';
import config from "./config.json";

enum Mode {
  repoSearch = 'repo',
  usersSearch = 'users',
}
const App: React.FC = () => {
  const [repoAndOwner, setRepoAndOwner] = useState({ repo: 'react', owner: 'facebook' });
  const [mode, setMode] = useState(Mode.repoSearch);
  const [authToken, setToken] = useState(config.AUTH_TOKEN);

  const onSearchContributors = (arg: { repo: string; owner: string }) => {
    setRepoAndOwner(arg);
    setMode(Mode.usersSearch);
  }
  const onSearchRepositories = () => {
    setMode(Mode.repoSearch);
  }

  return (
    <div className="App">
      <main>
        {mode === Mode.repoSearch && <RepositoriesView auth={authToken} onUsersSearchClick={onSearchContributors}/>}
        {mode === Mode.usersSearch && <UsersView {...repoAndOwner} onSearchRepos={onSearchRepositories} auth={authToken}/>}
      </main>
    </div>
  );
}

export default App;
