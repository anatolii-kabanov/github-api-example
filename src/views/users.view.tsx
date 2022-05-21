import React, { useEffect, useMemo, useState } from 'react';
import { Octokit } from 'octokit';
import './users.view.css';
import _ from 'lodash';

interface UsersViewProps {
    repo: string;
    owner: string;
    onSearchRepos(): void;
    auth?: string | null;
}

export const UsersView: React.FC<UsersViewProps> = ({ repo, owner, onSearchRepos, auth }) => {
    
    const [isLoading, setIsLoading] = useState(false);
    const [usersList, setUsersList] = useState<{ id?: number, avatar?: string, userName?: string, userUrl?: string, name?: string, email?: string }[]>([]);
    const [currentPage, setPage] = useState(1);

    const octokit = new Octokit({
        auth: auth
    });

    const fetchData = async () => {
        setIsLoading(true);
        const result = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
            anon: '1',
            owner: owner,
            repo: repo,
            per_page: 100,
            page: currentPage,
        }).finally(() => {
            setIsLoading(false);
        });

        const users = result.data.map((u) => ({ id: u.id, avatar: u.avatar_url, userName: u.login, userUrl: u.html_url, email: u.email, name: u.name }));

        setUsersList(users);
    }

    const getRepos = useMemo(
        () => _.throttle(fetchData, 1000)
      , []);

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const previousPage = () => {
        if (currentPage === 1) {
            return;
        }
        setPage(currentPage - 1);
    }

    const nextPage = () => {
        if (usersList?.length !== 100) {
            return;
        }
        setPage(currentPage + 1);
    }

    return <div>
        <div>
            <button onClick={onSearchRepos}>Search Repositories</button>
            <div>
                <button onClick={previousPage}>Previous</button>
                <span>{currentPage}</span>
                <button onClick={nextPage}>Next</button>
            </div>
        </div>
        <div className='users-container'>
        {isLoading && <div>Loading...</div>}
        {!isLoading && usersList?.map((u) => {
            return <div key={u.id ?? u.email} className='user'>
                <div>{u.userName ?? u.name}</div>
                <a href={u.userUrl} target='_blank' rel='noopener noreferrer'>
                    <img className='avatar' src={u.avatar} alt={u.email}></img>
                    <div className='url'>{u.userUrl}</div>
                </a>
            </div>
        })}
        </div>
    </div>
}