import json

def load_usernames_from_following(following_file):
    with open(following_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    usernames = set()
    # Instagram wraps the following list in a main 'relationships_following' array
    for item in data.get("relationships_following", []):
        for data_field in item.get("string_list_data", []):
            usernames.add(data_field.get("value"))
    return usernames

def load_usernames_from_followers(followers_file):
    with open(followers_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    usernames = set()
    # Instagram structures the followers list slightly differently
    # It might be a top-level list or nested depending on the export version
    items = data if isinstance(data, list) else data.get("relationships_followers", [])
    
    for item in items:
        for data_field in item.get("string_list_data", []):
            usernames.add(data_field.get("value"))
    return usernames

def main():
    # Make sure these filenames match exactly what is in your folder
    following_file = "following.json"
    followers_file = "followers_1.json" 
    
    try:
        following = load_usernames_from_following(following_file)
        followers = load_usernames_from_followers(followers_file)
        
        # Determine who is in 'following' but not in 'followers'
        not_following_back = following - followers
        
        print("\n--- ACCOUNTS NOT FOLLOWING YOU BACK ---")
        print(f"Total: {len(not_following_back)}\n")
        
        for index, user in enumerate(sorted(not_following_back), 1):
            print(f"{index}. {user}")
            
    except FileNotFoundError as e:
        print(f"Error: Could not find the file. Please check your filenames. ({e})")

if __name__ == "__main__":
    main()