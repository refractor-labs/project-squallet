export const formatDate = (d: Date) => {
    const date = new Date(d);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleString('en-US', options);
};
