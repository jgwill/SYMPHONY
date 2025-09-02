
import { GH_TOKEN_PLACEHOLDER } from '../constants';
import { GithubTreeFile } from '../types';

const GH_TOKEN = process.env.GH_TOKEN; 
const GITHUB_API_BASE_URL = 'https://api.github.com';

if (!GH_TOKEN || GH_TOKEN === GH_TOKEN_PLACEHOLDER || GH_TOKEN === "YOUR_GITHUB_TOKEN") {
  console.warn(`GitHub Token (GH_TOKEN) not found or is a placeholder. Live GitHub operations will not be available.`);
}

const ghFetch = async (url: string, options: RequestInit = {}) => {
  if (!GH_TOKEN || GH_TOKEN === GH_TOKEN_PLACEHOLDER || GH_TOKEN === "YOUR_GITHUB_TOKEN") {
    throw new Error("GitHub token (GH_TOKEN) not configured. Cannot perform GitHub operations. Please set it in your environment.");
  }

  const response = await fetch(`${GITHUB_API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${GH_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error(`GitHub API Error on ${url}:`, errorData);
    throw new Error(`GitHub API Error (${response.status}): ${errorData.message || 'Unknown error'}`);
  }
  
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null; // No content to parse
  }
  return response.json();
};


export const githubService = {
  getRepoFileTree: async (repoFullName: string): Promise<GithubTreeFile[]> => {
    const data = await ghFetch(`/repos/${repoFullName}/git/trees/main?recursive=1`);
    if (!data || !data.tree) {
        throw new Error("Invalid response from GitHub API: 'tree' property is missing.");
    }
    return data.tree as GithubTreeFile[];
  },

  createPullRequest: async (
    repoFullName: string, 
    newBranchName: string, 
    baseBranch: string,
    commitMessage: string,
    prTitle: string,
    prBody: string,
    filesToCommit: { path: string, content: string }[]
  ): Promise<{ html_url: string; number: number; message?: string }> => {
    
    // 1. Get the latest commit SHA of the base branch
    const baseBranchRef = await ghFetch(`/repos/${repoFullName}/git/ref/heads/${baseBranch}`);
    const baseCommitSha = baseBranchRef.object.sha;

    // 2. Get the tree SHA of the base commit
    const baseCommit = await ghFetch(`/repos/${repoFullName}/git/commits/${baseCommitSha}`);
    const baseTreeSha = baseCommit.tree.sha;

    // 3. Create a new branch
    await ghFetch(`/repos/${repoFullName}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({
            ref: `refs/heads/${newBranchName}`,
            sha: baseCommitSha
        })
    });

    // 4. Create blobs for each file
    const fileBlobs = await Promise.all(filesToCommit.map(file => 
      ghFetch(`/repos/${repoFullName}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: file.content, encoding: 'utf-8' })
      })
    ));

    // 5. Create a new tree with the new blobs
    const newTree = await ghFetch(`/repos/${repoFullName}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: filesToCommit.map((file, index) => ({
          path: file.path,
          mode: '100644', // file (blob)
          type: 'blob',
          sha: fileBlobs[index].sha
        }))
      })
    });

    // 6. Create a new commit
    const newCommit = await ghFetch(`/repos/${repoFullName}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: commitMessage,
        tree: newTree.sha,
        parents: [baseCommitSha]
      })
    });
    
    // 7. Update the new branch reference to point to the new commit
    await ghFetch(`/repos/${repoFullName}/git/refs/heads/${newBranchName}`, {
      method: 'PATCH', // Use PATCH for updates
      body: JSON.stringify({
        sha: newCommit.sha,
        force: false // Set to false to avoid overwriting
      })
    });

    // 8. Create the pull request
    const prData = await ghFetch(`/repos/${repoFullName}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title: prTitle,
        body: prBody,
        head: newBranchName,
        base: baseBranch
      })
    });

    return {
      html_url: prData.html_url,
      number: prData.number,
      message: `Successfully created Pull Request #${prData.number}!`
    };
  },

  pushToBranch: async (
    repoFullName: string, 
    branchName: string, 
    commitMessage: string
  ): Promise<{ commit_url: string; message?: string }> => {
    // This is a placeholder for a more complex direct push logic
    throw new Error("Direct push functionality is not implemented yet. Please use the Pull Request flow.");
  },
};