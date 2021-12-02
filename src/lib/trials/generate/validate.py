# This file will be used to compare and validate two JSON files containing
# information for trials.


import hashlib


def read_file_bytes(path: str):
    """
    Load a set of trial configurations from the specified JSON file.

    :return: string representing the contents of the parameters file
    """
    with open(path, "rb") as f:
        _contents = f.read()

    return _contents


def read_file_string(path: str):
    """
    Load a set of trial configurations from the specified JSON file.

    :return: string representing the contents of the parameters file
    """
    with open(path, "r", encoding="utf-8") as f:
        _contents = f.read()

    return _contents


def main():
    file_path = input("File path > ")

    # Try loading file one
    file_data = None
    try:
        file_data = read_file_bytes(file_path)
    except Exception as e:
        print("Error loading file:", e)

    if file_data is not None:
        # Run a checksum to make sure the trials match the hash in each file
        # Generate the trials hash for each file
        trials_hash = hashlib.sha256(file_data).hexdigest()

        # Load the hash from "checksum.txt"
        stored_hash = read_file_string("./checksum.txt")

        # Compare hash for file
        if trials_hash == stored_hash:
            print("No issues detected with file \"{}\" ({})".format(file_path, trials_hash))
        else:
            print("Errors identified: file \"{}\" has hash \"{}\", does not match expected hash \"{}\".".format(
                file_path,
                trials_hash,
                stored_hash
            ))


if __name__ == "__main__":
    main()
