import axios  from "axios";

export async function scrapeGitHub(username : String){
    const repos = await axios.get(`https://api.github.com/users/${username}/repos`);
    const filteredUserRepos = repos.data.map((x : any) => ({
        description : x.description,
        name : x.name,
        fullName : x.full_name,
        starCount : x.stargazers_count
    }));
    return filteredUserRepos;
}