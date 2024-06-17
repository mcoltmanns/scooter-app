import { Job } from 'node-schedule';

// class for tracking/managing active jobs
class JobManager {
    private activeJobs: Job[] = [];

    // add a job
    public addJob(job: Job): void {
        console.log(`adding job ${job.name}`);
        this.activeJobs.push(job);
    }

    // remove a job if it was in the list. if it wasn't, do nothing
    public removeJob(jobName: string): void {
        const i = this.activeJobs.findIndex((value: Job) => {
            return value.name === jobName;
        });
        if(i > -1) {
            console.log(`removing job ${this.activeJobs[i].name}`);
            this.activeJobs.splice(i, 1);
        }
    }

    // reschedule a job
    public rescheduleJob(jobName: string, newTime: number): void {
        const j = this.activeJobs.find((value: Job) => {
            return value.name === jobName;
        });
        console.log(`rescheduling job ${j.name} to ${newTime}`);
        j.reschedule(new Date(newTime));
    }

    public toString(): string {
        return this.activeJobs.toString();
    }
}

export default new JobManager();