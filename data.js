const navLinks = [
    {
        href: 'new-post',
        text: 'Write a post'
    },
    {
        href: 'all-posts',
        text: 'My Posts'
    },
    {
        href: 'membership',
        text: 'Become a member'
    },
    {
        href: 'update',
        text: 'Settings'
    },
    {
        href: 'delete',
        text: 'Delete Account'
    }
];

const defaultPfpUrl = 'url(/images/defaultImg.png)';

const alphaFullNameErr = 'can only contain letters.';
const alphaUsernameErr = 'can only contain letters and numbers.';
const alphaMsgErr = 'can only contain letters, numbers, commas, full stop and space.';
const lengthErr = 'must be between 2 and 20 characters.';
const lengthMessageErr = 'can only be up to 100 characters.';
const emptyErr = 'Please enter your';

module.exports = {
    navLinks,
    defaultPfpUrl,
    alphaFullNameErr,
    alphaUsernameErr,
    lengthErr,
    alphaMsgErr,
    lengthMessageErr,
    emptyErr
};