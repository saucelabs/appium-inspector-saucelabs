# Working on this fork

---

# NOTE

For now the steps for syncing an merging are manual steps. We expect that the amount of changes in the original project will be less and thus not worth the automation process (yet). But feel free to automate this =)

Secondly, we've choses to keep the `feat/add-saucestreaming`-branch as the default. This makes syncs easier and will give a better overview of what changed.

---

## Prerequisites

1. Make sure that you've cloned this project and are on the `feat/add-saucestreaming` branch.
2. Install all dependencies al described in [this](../README.md#development)-paragraph

## Syncing the project

Syncing this for with the appium-inspector project is a manual job and consists out of the following steps (src: [How to merge two repositories on git?](https://blog.devgenius.io/how-to-merge-two-repositories-on-git-b0ed5e3b4448)).

1.  Create another remote in this project which points to appium-inspector project

        git remote add origin-fetch https://github.com/appium/appium-inspector.git

    Now you will have the following remotes when you run `git remote -v`

        origin  https://github.com/saucelabs/appium-inspector-saucelabs.git (fetch)
        origin  https://github.com/saucelabs/appium-inspector-saucelabs.git (push)
        origin-fetch    https://github.com/appium/appium-inspector.git (fetch)
        origin-fetch    https://github.com/appium/appium-inspector.git (push)

2.  Fetch content from the original project into this remote

    git fetch origin-fetch

3.  Note that the content of original project is in the remote still, which we fetched but can’t yet access. So we copy it onto a new local branch.

        git checkout -b <new-branch-name> origin-fetch/main

    Check for files if you have to, see if you’ve correctly pulled in the right data.

4.  Now merge with `main`. Notice that the last command had you checkout of the `main` branch and into a new-branch. So, first checkout from that to `main` with

        git checkout main

    then run:

        git merge <new-branch-name>

5.  Resolve the conflicts and create a PR, see [Fixing or adding a new feature](#fixing-or-adding-a-new-feature)

## Fixing or adding a new feature

We try to prevent adding too many feature to this fork. This way we keep as close to the original project and reduce complexity. Please contact Wim Selles to discuss this.

Every fix/feature needs to be in it's own branch and a PR needs to be created for review

## Build the app
This process is a manual process now. I have 3 machines (Mac/Windows/Linux) and build them manual with this step

    npx electron-builder build --publish never
    
This will package the app for the platform that the project is running on (into `release/`).

## Releasing the app
1. Make sure that you've updated the version in the [`package.json`](../package.json)-file. The format is 

        {original-version-from-appium-inspector}-saucelabs.{#}`
        
    We need to keep the versions of the original project in line with our releases. In the end this will look like this

        2022.2.1-saucelabs.1

2. Create a manual release in the [releases](https://github.com/saucelabs/appium-inspector-saucelabs/releases)-tab. Provide info what changed/was fixed and upload the apps (from the [Build the app](#build-the-app)-step).