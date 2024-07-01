
export const afterOrgChange = (urlPath: string) => {
	if (window.location.pathname === urlPath) {
		window.location.reload();
	}
	return urlPath;
};
