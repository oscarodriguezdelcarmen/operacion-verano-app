#!/usr/bin/env python3
"""
Handle GitHub Issue events for PWA push registration and daily gold completion.

Uses GitHub CLI (gh) for secret management to keep the workflow simple.
"""

import os
import sys
import json
import re
import subprocess
import urllib.request
import urllib.error

GH_TOKEN = os.environ.get("GH_TOKEN", "")
if not GH_TOKEN:
    print("ERROR: GH_TOKEN not set", file=sys.stderr)
    sys.exit(1)

REPO = os.environ.get("GITHUB_REPOSITORY", "oscarodriguezdelcarmen/operacion-verano-app")
ISSUE_NUMBER = os.environ.get("ISSUE_NUMBER", "")
EVENT_PATH = os.environ.get("GITHUB_EVENT_PATH", "")

HEADERS = {
    "Authorization": f"token {GH_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "OPERACION-VERANO-GHA",
}



def close_issue():
    if not ISSUE_NUMBER:
        return
    try:
        url = f"https://api.github.com/repos/{REPO}/issues/{ISSUE_NUMBER}"
        body = json.dumps({"state": "closed"}).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="PATCH", headers={**HEADERS, "Content-Type": "application/json"})
        with urllib.request.urlopen(req) as r:
            r.read()
        print(f"Closed issue #{ISSUE_NUMBER}")
    except Exception as e:
        print(f"Could not close issue: {e}", file=sys.stderr)


def run_cmd(cmd, check=True):
    """Run a shell command and return output."""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, env={**os.environ, "GH_TOKEN": GH_TOKEN})
    if check and result.returncode != 0:
        print(f"Command failed: {cmd}\n{result.stderr}", file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def set_secret(name, value):
    """Set a secret using GitHub CLI."""
    run_cmd(f'gh secret set {name} -b{value} --app actions')
    print(f"Updated secret: {name}")


def clear_secret(name):
    """Delete a secret."""
    try:
        run_cmd(f"gh secret remove {name} --app actions", check=False)
        print(f"Deleted secret: {name}")
    except SystemExit:
        print(f"Secret {name} not found or already deleted")


def send_welcome_push(sub_json):
    """Send a welcome push notification."""
    vapid_priv = os.environ.get("VAPID_PRIVATE_KEY", "")
    if not vapid_priv:
        print("No VAPID_PRIVATE_KEY - skipping welcome push", file=sys.stderr)
        return

    endpoint = sub_json.get("endpoint", "")
    if not endpoint:
        print("No endpoint in subscription", file=sys.stderr)
        return

    print(f"Welcome push queued for: {endpoint[:50]}...")
    print("Use the web-push npm package for production VAPID signing.")


def main():
    # Read issue data
    title = os.environ.get("ISSUE_TITLE", "")
    body = os.environ.get("ISSUE_BODY", "")

    if not title:
        if os.path.exists(EVENT_PATH):
            with open(EVENT_PATH) as f:
                event = json.load(f)
            issue = event.get("issue", {})
            title = issue.get("title", "")
            body = issue.get("body", "")

    print(f"Handling issue titled: {title}")
    close_issue()

    if "PUSH_REGISTER" in title:
        try:
            sub_json = json.loads(body.strip())
        except json.JSONDecodeError:
            sub_json = {"raw_body": body}

        try:
            set_secret("PUSH_SUBSCRIPTION", json.dumps(sub_json, ensure_ascii=False))
            send_welcome_push(sub_json)
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            sys.exit(1)

    elif "GOLD_COMPLETED" in title:
        match = re.search(r'"date"\s*:\s*"([^"]+)"', body)
        date_val = match.group(1) if match else "unknown"
        try:
            set_secret("COMPLETED_DATE", date_val)
            print(f"Completed date: {date_val}")
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            sys.exit(1)

    elif "GOLD_REVOKED" in title:
        try:
            clear_secret("COMPLETED_DATE")
            print("Cleared COMPLETED_DATE")
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            sys.exit(1)

    print("Done.")


if __name__ == "__main__":
    main()
