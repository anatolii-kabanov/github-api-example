import React, { useEffect, useMemo, useState } from 'react';
import { Octokit } from 'octokit';
import './repositories.view.css';
import _ from 'lodash';

interface RepositoriesViewProps {
    onUsersSearchClick(repoAndOwner: { repo: string; owner: string }): void;
    auth?: string | null;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({ onUsersSearchClick, auth }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('react');
    const [repositories, setRepositories] = useState<{ 
        id?: number, 
        name?: string, 
        owner?: string | null,
        url?: string, 
        avatar?: string, 
        stars?: number,
        description: string | null,
        created?: Date,
    }[]>([]);
    const [currentPage, setPage] = useState(1);

    const octokit = new Octokit({
        auth: auth
    });

    const fetchData = async () => {
        setIsLoading(true);
        const result = await octokit.request('GET /search/repositories', {
            q: `${input} in:name`,
            page: currentPage,
            per_page: 100,
        })
        .finally(() => {
            setIsLoading(false);
        })

        const repos = result.data.items.map((u) => ({ 
            id: u.id, name: u.name, owner: u.owner?.login, url: u.html_url, avatar: u.owner?.avatar_url, stars: u.stargazers_count, description: u.description, created: new Date(u.created_at)
         }));

        setRepositories(repos);
    }

    const getRepos = useMemo(
        () => _.throttle(fetchData, 1000)
      , [input]);

    useEffect(() => {
        getRepos();
    }, [input, currentPage, auth]);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);
    };

    const previousPage = () => {
        if (currentPage === 1) {
            return;
        }
        setPage(currentPage - 1);
    }

    const nextPage = () => {
        if (repositories?.length !== 100) {
            return;
        }
        setPage(currentPage + 1);
    }

    return <div>
        <div className='search-container'>
            <input className='search-input' value={input} onChange={onInputChange}></input>
            <div>
                <button onClick={previousPage}>Previous</button>
                <span>{currentPage}</span>
                <button onClick={nextPage}>Next</button>
            </div>
        </div>
        <div className='repositories-container'>
        {isLoading && <div>Loading...</div>}
        {!isLoading && repositories?.map((r) => {
            return <div key={r.id} className='repository'>

                <a href={r.url} target='_blank' rel='noopener noreferrer'>
                    <div>User: {r.owner}</div>
                    <div>Repository: {r.name}</div>
                    <img className='avatar' src={r.avatar} alt={r.name}></img>
                </a>
                    <div>Created: {r.created?.toLocaleDateString()}</div>
                    <div className='description'>Description: {r.description}</div>
                <button onClick={() => onUsersSearchClick({ repo: r.name!, owner: r.owner! })}>Search Contributors</button>
            </div>
        })}
        </div>
    </div>
}