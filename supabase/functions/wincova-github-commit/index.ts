import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GitHubFile {
  path: string;
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, commitMessage, taskId } = await req.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error("No files provided");
    }

    const githubToken = Deno.env.get("GITHUB_TOKEN");
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN not configured");
    }

    const repo = "WINCOVA-STORE/shop-evolve-pro";
    const branch = "main";

    console.log(`Creating commit for ${files.length} files on ${repo}:${branch}`);

    // Get the latest commit SHA on the branch
    const refResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/ref/heads/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!refResponse.ok) {
      const error = await refResponse.text();
      throw new Error(`Failed to get branch ref: ${error}`);
    }

    const refData = await refResponse.json();
    const latestCommitSha = refData.object.sha;

    // Get the tree SHA from the latest commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!commitResponse.ok) {
      throw new Error("Failed to get commit");
    }

    const commitData = await commitResponse.json();
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file: GitHubFile) => {
        const blobResponse = await fetch(
          `https://api.github.com/repos/${repo}/git/blobs`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: file.content,
              encoding: "utf-8",
            }),
          }
        );

        if (!blobResponse.ok) {
          throw new Error(`Failed to create blob for ${file.path}`);
        }

        const blobData = await blobResponse.json();
        return {
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        };
      })
    );

    // Create a new tree with the blobs
    const treeResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: blobs,
        }),
      }
    );

    if (!treeResponse.ok) {
      throw new Error("Failed to create tree");
    }

    const treeData = await treeResponse.json();

    // Create a new commit
    const newCommitResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage || `[Wincova] Automatic code generation for task ${taskId}`,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      }
    );

    if (!newCommitResponse.ok) {
      throw new Error("Failed to create commit");
    }

    const newCommitData = await newCommitResponse.json();

    // Update the reference to point to the new commit
    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sha: newCommitData.sha,
        }),
      }
    );

    if (!updateRefResponse.ok) {
      throw new Error("Failed to update branch reference");
    }

    console.log(`Successfully created commit ${newCommitData.sha}`);

    return new Response(
      JSON.stringify({
        success: true,
        commitSha: newCommitData.sha,
        commitUrl: `https://github.com/${repo}/commit/${newCommitData.sha}`,
        message: "Code successfully committed to GitHub",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in wincova-github-commit:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
