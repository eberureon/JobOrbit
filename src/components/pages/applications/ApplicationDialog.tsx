import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form'
import { useToast } from '../../../hooks/use-toast'
import { APPLICATION_STATUSES } from '../../../types'
import type { ApplicationStatus } from '../../../types'
import { insertApplicationSchema } from '../../../db/schema'
import type { Application, InsertApplication } from '../../../db/schema'
import {
  createApplication,
  updateApplication,
} from '../../../lib/server/applications.functions'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ApplicationDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: Application | null
}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<InsertApplication>({
    resolver: zodResolver(insertApplicationSchema),
    values: editing
      ? {
          company: editing.company,
          role: editing.role,
          location: editing.location,
          status: editing.status as ApplicationStatus,
          applied_date: editing.applied_date,
          salary: editing.salary,
          source: editing.source,
          job_url: editing.job_url,
          notes: editing.notes,
        }
      : {
          company: '',
          role: '',
          location: '',
          status: 'Applied' as ApplicationStatus,
          applied_date: todayISO(),
          salary: '',
          source: '',
          job_url: '',
          notes: '',
        },
  })

  const mutation = useMutation({
    mutationFn: async (data: InsertApplication) => {
      if (editing) {
        await updateApplication({ data: { id: editing.id, ...data } })
      } else {
        await createApplication({ data })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast({
        title: editing ? 'Updated' : 'Created',
        description: editing
          ? 'Application updated.'
          : 'Application added.',
      })
      onOpenChange(false)
    },
    onError: (e: Error) =>
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      }),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Application' : 'Add Application'}
          </DialogTitle>
          <DialogDescription>
            Track a new job application with company, role, status and notes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-company"
                        placeholder="Acme Inc."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-role"
                        placeholder="Senior Engineer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-location"
                        placeholder="Remote · Berlin"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {APPLICATION_STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            data-testid={`option-status-${s}`}
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applied_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applied Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-applied-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-salary"
                        placeholder="$120k or €60k-80k"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-source"
                        placeholder="LinkedIn / Referral / Indeed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-job-url"
                        placeholder="https://…"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      data-testid="input-notes"
                      rows={4}
                      placeholder="Recruiter contact, interview prep, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit-application"
              >
                {mutation.isPending
                  ? 'Saving…'
                  : editing
                  ? 'Save changes'
                  : 'Add application'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
