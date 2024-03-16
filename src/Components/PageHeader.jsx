const PageHeader = ({ title, subtitle, sidebarRenderer }) => {
    return (
        <div className="bg-gray-100 w-full min-h-[100px] flex items-center">
            <div className="container mx-auto h-full">
                <div className="flex justify-between items-center !p-6">
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    </div>
                    <div>
                        {sidebarRenderer()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageHeader;
