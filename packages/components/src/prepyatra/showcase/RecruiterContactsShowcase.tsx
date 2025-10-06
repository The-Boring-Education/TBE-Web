import {Button} from "../ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../ui/table";

const RecruiterContactsShowcase = () => {
    const recruiters = [
        {
            name: "Sarah Johnson",
            company: "TechCorp",
            position: "Senior Recruiter",
            email: "sarah.j@techcorp.com",
            phone: "+1 (555) 123-4567",
            lastContact: "2 days ago",
            status: "Active"
        },
        {
            name: "Mike Chen",
            company: "StartupXYZ",
            position: "Talent Acquisition",
            email: "mike@startupxyz.com",
            phone: "+1 (555) 987-6543",
            lastContact: "1 week ago",
            status: "Follow-up"
        },
        {
            name: "Emily Rodriguez",
            company: "BigTech Inc",
            position: "HR Manager",
            email: "e.rodriguez@bigtech.com",
            phone: "+1 (555) 456-7890",
            lastContact: "3 days ago",
            status: "Interview Scheduled"
        }
    ];

    return (
        <section className='py-20 px-4'>
            <div className='container mx-auto'>
                <div className='text-center mb-16 animate-fade-in'>
                    <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                        📞{" "}
                        <span className='text-primary'>Recruiter Contacts</span>
                    </h2>
                    <p className='text-xl text-gray max-w-3xl mx-auto'>
                        Never lose track of your valuable recruiter connections.
                        Organize, manage, and follow up with ease.
                    </p>
                </div>

                <div className='max-w-6xl mx-auto animate-slide-in-left'>
                    <Card className='glass-dark border-primary/20'>
                        <CardHeader className='text-center'>
                            <CardTitle className='text-2xl text-white flex items-center justify-center gap-2'>
                                🔥 Your Recruiter Network Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='mb-4 flex justify-between items-center'>
                                <div className='text-gray'>
                                    <span className='text-primary font-semibold'>
                                        {recruiters.length}
                                    </span>{" "}
                                    Active Contacts
                                </div>
                                <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
                                    + Add New Contact
                                </Button>
                            </div>

                            <div className='overflow-x-auto'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='border-primary/20'>
                                            <TableHead className='text-primary'>
                                                Name
                                            </TableHead>
                                            <TableHead className='text-primary'>
                                                Company
                                            </TableHead>
                                            <TableHead className='text-primary'>
                                                Position
                                            </TableHead>
                                            <TableHead className='text-primary'>
                                                Contact
                                            </TableHead>
                                            <TableHead className='text-primary'>
                                                Last Contact
                                            </TableHead>
                                            <TableHead className='text-primary'>
                                                Status
                                            </TableHead>
                                            <TableHead className='text-primary'>
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recruiters.map((recruiter, index) => (
                                            <TableRow
                                                key={index}
                                                className='border-primary/10 hover:bg-primary/5 transition-colors'>
                                                <TableCell className='text-white font-medium'>
                                                    {recruiter.name}
                                                </TableCell>
                                                <TableCell className='text-gray'>
                                                    {recruiter.company}
                                                </TableCell>
                                                <TableCell className='text-gray'>
                                                    {recruiter.position}
                                                </TableCell>
                                                <TableCell className='text-gray text-sm'>
                                                    <div>{recruiter.email}</div>
                                                    <div>{recruiter.phone}</div>
                                                </TableCell>
                                                <TableCell className='text-gray'>
                                                    {recruiter.lastContact}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            recruiter.status ===
                                                            "Active"
                                                                ? "bg-green-500/20 text-green-400"
                                                                : recruiter.status ===
                                                                  "Follow-up"
                                                                ? "bg-yellow-500/20 text-yellow-400"
                                                                : "bg-blue-500/20 text-blue-400"
                                                        }`}>
                                                        {recruiter.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex gap-2'>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            className='text-xs border-primary/30 hover:bg-primary/10'>
                                                            📞 Call
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            className='text-xs border-primary/30 hover:bg-primary/10'>
                                                            ✉️ Email
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default RecruiterContactsShowcase;
