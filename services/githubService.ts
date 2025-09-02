import { GH_TOKEN_PLACEHOLDER } from '../constants';
import { delay } from '../lib/utils';
import { GithubTreeFile } from '../types';

const GH_TOKEN = process.env.GH_TOKEN; 

if (!GH_TOKEN || GH_TOKEN === GH_TOKEN_PLACEHOLDER || GH_TOKEN === "YOUR_GITHUB_TOKEN") {
  console.warn(`GitHub Token (GH_TOKEN) not found or is the placeholder. Mock GitHub operations will indicate token absence. Live file tree will not be available.`);
}

export const githubService = {
  getRepoFileTree: async (repoFullName: string): Promise<GithubTreeFile[]> => {
    if (!GH_TOKEN || GH_TOKEN === GH_TOKEN_PLACEHOLDER || GH_TOKEN === "YOUR_GITHUB_TOKEN") {
      throw new Error("GitHub token (GH_TOKEN) not configured. Cannot fetch file tree.");
    }
    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) {
        throw new Error("Invalid repository name format. Expected 'owner/repo'.");
    }

    // Using main as default, could be parameterized later
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to fetch file tree: ${response.status} ${errorData.message || 'Unknown Error'}`);
    }

    const data = await response.json();
    if (!data.tree) {
        throw new Error("Invalid response from GitHub API: 'tree' property is missing.");
    }
    return data.tree as GithubTreeFile[];
  },

  createPullRequest: async (
    repoFullName: string, 
    branchName: string, 
    title: string, 
    body: string, 
    baseBranch: string = 'main'
  ): Promise<{ html_url: string; number: number; message?: string }> => {
    if (!GH_TOKEN || GH_TOKEN === GH_TOKEN_PLACEHOLDER || GH_TOKEN === "YOUR_GITHUB_TOKEN") {
      return Promise.reject(new Error("GitHub token (GH_TOKEN) not configured. Cannot create pull request. Please set it in your environment."));
    }
    console.log(`Mocking GitHub API: Create PR for ${repoFullName}`);
    console.log(`Branch: ${branchName}, Base: ${baseBranch}, Title: ${title}`);
    await delay(null, 1500); 
    const prNumber = Math.floor(Math.random() * 1000) + 1;
    return {
      html_url: `https://github.com/${repoFullName}/pull/${prNumber}`,
      number: prNumber,
      message: `Mock: Pull request #${prNumber} created successfully for branch '${branchName}'!`
    };
  },

  pushToBranch: async (
    repoFullName: string, 
    branchName: string, 
    commitMessage: string
  ): Promise<{ commit_url: string; message?: string }> => {
    if (!GH_TOKEN || GH_TOKEN === GH_TOKEN_PLACEHOLDER || GH_TOKEN === "YOUR_GITHUB_TOKEN") {
      return Promise.reject(new Error("GitHub token (GH_TOKEN) not configured. Cannot push to branch. Please set it in your environment."));
    }
    console.log(`Mocking GitHub API: Push to ${repoFullName}, branch ${branchName}`);
    console.log(`Commit Message: ${commitMessage}`);
    await delay(null, 1200); 
    const commitSha = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return {
      commit_url: `https://github.com/${repoFullName}/commit/${commitSha}`,
      message: `Mock: Changes pushed successfully to branch '${branchName}'!`
    };
  },
};